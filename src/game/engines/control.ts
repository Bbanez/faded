import type {
  ControlEnginePrototype,
  Entity,
  InputServicePrototype,
  InputServiceState,
  PositionVector,
} from '../types';
import { InputServiceSubscriptionType } from '../types';
import { Group, Raycaster, Vector3 } from 'three';

export function ControlEngine(
  inputService: InputServicePrototype,
  terrainMesh?: Group | null
): ControlEnginePrototype {
  const ray = new Raycaster();
  const rayDir = new Vector3(0, -1, 0);
  let entity: Entity | null = null;
  let state: InputServiceState | null = null;
  const speed = 0.1;
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
  const oldMousePosition = {
    x: 0,
    y: 0,
  };
  const mouseDeltaConst = Math.PI / (window.innerWidth / 2);

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

      move.z =
        acc.a * Math.cos(entity.object.rotation.y) +
        acc.b * Math.cos(entity.object.rotation.y + Math.PI / 2);
      move.x =
        acc.a * Math.sin(entity.object.rotation.y) +
        acc.b * Math.sin(entity.object.rotation.y + Math.PI / 2);
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
        if (st.mouse.click.right) {
          if (!latchMouse) {
            latchAngle = entity.object.rotation.y;
            latchMouse = true;
            oldMousePosition.x = st.mouse.x;
            oldMousePosition.y = st.mouse.y;
          }
          const delta = st.mouse.x - oldMousePosition.x;
          angleDelta = mouseDeltaConst * delta;
        } else {
          latchMouse = false;
        }
      }
    }
  );

  const self: ControlEnginePrototype = {
    controlEntity(_entity) {
      entity = _entity;
    },
    setTerrain(terrain) {
      terrainMesh = terrain;
    },
    update() {
      if (entity) {
        calc();
        const newPos: PositionVector = {
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
          // console.log(intersect);
        }
        const newOrientation: PositionVector = {
          x: entity.object.rotation.x,
          y: latchAngle + angleDelta,
          z: entity.object.rotation.z,
        };
        entity.update(newPos, newOrientation);
      }
    },
  };
  return self;
}
