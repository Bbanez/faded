import type {
  ControlEngineObject,
  ControlEnginePrototype,
  InputServicePrototype,
  InputServiceState,
} from '../types';
import { InputServiceSubscriptionType } from '../types';

export function ControlEngine(
  inputService: InputServicePrototype
): ControlEnginePrototype {
  let obj: ControlEngineObject | null = null;
  let state: InputServiceState | null = null;
  const speed = 0.7;
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
    if (obj && state) {
      if (
        (state.keyboard.a && state.keyboard.d) ||
        (!state.keyboard.a && !state.keyboard.d)
      ) {
        acc.b = 0.0;
      } else if (state.keyboard.a) {
        acc.b = -speed;
      } else if (state.keyboard.d) {
        acc.b = speed;
      }
      if (
        (state.keyboard.w && state.keyboard.s) ||
        (!state.keyboard.w && !state.keyboard.s)
      ) {
        acc.a = 0.0;
      } else if (state.keyboard.w) {
        acc.a = -speed;
      } else if (state.keyboard.s) {
        acc.a = speed;
      }

      move.z =
        acc.a * Math.cos(obj.rotation.y) +
        acc.b * Math.cos(obj.rotation.y + Math.PI / 2);
      move.x =
        acc.a * Math.sin(obj.rotation.y) +
        acc.b * Math.sin(obj.rotation.y + Math.PI / 2);
      if (acc.a !== 0 && acc.b !== 0) {
        move.x /= 1.5;
        move.z /= 1.5;
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
      if (obj) {
        if (st.mouse.click.right) {
          if (!latchMouse) {
            latchAngle = obj.rotation.y;
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
    controlObject(object) {
      obj = object;
    },
    update() {
      if (obj) {
        calc();
        obj.position.x += move.x;
        obj.position.z += move.z;
        obj.rotation.y = latchAngle + angleDelta;
      }
    },
  };
  return self;
}
