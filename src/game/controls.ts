import type {
  CameraServicePrototype,
  ControlsPrototype,
  Entity,
  InputServicePrototype,
  InputServiceState,
  Point3D,
} from './types';
import { InputServiceSubscriptionType } from './types';
import { Group, Raycaster, Vector3 } from 'three';
import { PI12 } from './const';

export function createControls(
  inputService: InputServicePrototype,
  camera: CameraServicePrototype,
  terrainMesh?: Group | null
): ControlsPrototype {
  const ray = new Raycaster();
  const rayDir = new Vector3(0, -1, 0);
  let entity: Entity | null = null;
  let state: InputServiceState | null = null;
  const speed = 0.3;
  const move = {
    x: 0,
    z: 0,
  };
  const acc = {
    a: 0,
    b: 0,
  };
  let latchMouse = false;
  let latchAngle = 0;
  let angleDelta = 0;
  let entityOrientation = -camera.getOrientation() - PI12;
  const oldMousePosition = {
    x: 0,
    y: 0,
  };
  const mouseDeltaConst = Math.PI / (window.innerWidth / 2);
  const dash: {
    allow: boolean;
    perform: boolean;
    strength: number;
    multi: number;
    fnDirection: -1 | 1;
  } = {
    allow: true,
    perform: false,
    strength: 7,
    multi: 1,
    fnDirection: 1,
  };

  function doDash() {
    if (dash.perform) {
      dash.multi += dash.fnDirection;
      if (dash.multi > dash.strength) {
        dash.multi = dash.strength;
        dash.fnDirection = -1;
      } else if (dash.multi < 1) {
        dash.multi = 1;
        dash.fnDirection = 1;
        dash.perform = false;
      }
      acc.a *= dash.multi;
      acc.b *= dash.multi;
    }
  }
  function calc() {
    if (entity && state) {
      if (
        (state.keyboard.w && state.keyboard.s) ||
        (!state.keyboard.w && !state.keyboard.s)
      ) {
        acc.a = 0.0;
      } else if (state.keyboard.w) {
        acc.a = speed;
        entity.playAnimation('slowRun');
      } else if (state.keyboard.s) {
        acc.a = -speed;
        entity.playAnimation('backward');
      }

      if (
        (state.keyboard.a && state.keyboard.d) ||
        (!state.keyboard.a && !state.keyboard.d)
      ) {
        acc.b = 0.0;
      } else if (state.keyboard.a) {
        if (acc.a === 0) {
          entity.playAnimation('left');
        }
        acc.b = speed;
      } else if (state.keyboard.d) {
        if (acc.a === 0) {
          entity.playAnimation('right');
        }
        acc.b = -speed;
      }
      if (dash.allow && state.keyboard.shift) {
        dash.allow = false;
        dash.perform = true;
        setTimeout(() => {
          dash.allow = true;
        }, 1000);
      }
      doDash();

      move.z =
        acc.a * Math.cos(entity.object.rotation.y) +
        acc.b * Math.cos(entity.object.rotation.y + Math.PI / 2);
      move.x =
        acc.a * Math.sin(entity.object.rotation.y) +
        acc.b * Math.sin(entity.object.rotation.y + Math.PI / 2);
      if (acc.a !== 0 || acc.b !== 0) {
        if (
          state.mouse.click.middle &&
          (state.keyboard.w ||
            state.keyboard.a ||
            state.keyboard.s ||
            state.keyboard.d)
        ) {
          entityOrientation = -camera.getOrientation() - PI12;
        }
      }
      if (acc.a !== 0 && acc.b !== 0) {
        move.x /= 1.5;
        move.z /= 1.5;
      } else if (acc.a === 0 && acc.b === 0) {
        entity.playAnimation('idle');
      }
    }
  }
  inputService.subscribe(InputServiceSubscriptionType.KEY_DOWN, (_type, st) => {
    state = st;
  });
  inputService.subscribe(InputServiceSubscriptionType.KEY_UP, (_type, st) => {
    state = st;
  });
  inputService.subscribe(
    InputServiceSubscriptionType.MOUSE_MOVE,
    (_type, st) => {
      if (entity) {
        if (
          st.mouse.click.middle &&
          (st.keyboard.w || st.keyboard.a || st.keyboard.s || st.keyboard.d)
        ) {
          entityOrientation = -camera.getOrientation() - PI12;
        } else if (st.mouse.click.right) {
          if (!latchMouse) {
            latchAngle = entity.object.rotation.y;
            latchMouse = true;
            oldMousePosition.x = st.mouse.x;
            oldMousePosition.y = st.mouse.y;
          }
          const delta = oldMousePosition.x - st.mouse.x;
          angleDelta = mouseDeltaConst * delta;
          entityOrientation = latchAngle + angleDelta;
        } else {
          latchMouse = false;
        }
      }
    }
  );

  return {
    controlEntity(_entity) {
      entity = _entity;
    },
    setTerrain(terrain) {
      terrainMesh = terrain;
    },
    disableDashFor(millis) {
      dash.allow = false;
      setTimeout(() => {
        dash.allow = true;
      }, millis);
    },
    update() {
      if (entity) {
        calc();
        const newPos: Point3D = {
          x: entity.object.position.x + move.x,
          y: entity.object.position.y,
          z: entity.object.position.z + move.z,
        };
        if (terrainMesh) {
          ray.set(new Vector3(newPos.x, 100, newPos.z), rayDir);
          const intersect = ray.intersectObject(terrainMesh, true);
          if (intersect[0]) {
            newPos.y = intersect[0].point.y;
          }
        }
        const newOrientation: Point3D = {
          x: entity.object.rotation.x,
          y: entityOrientation, // latchAngle + angleDelta,
          z: entity.object.rotation.z,
        };
        entity.update(newPos, newOrientation);
      }
    },
  };
}
