import { v4 as uuidv4 } from 'uuid';
import type {
  InputServiceHandler,
  InputServicePrototype,
  InputServiceState,
} from '../types';
import { InputServiceSubscriptionType } from '../types';

export function InputService() {
  const state: InputServiceState = {
    keyboard: {
      key: '',
      alt: false,
      ctrl: false,
      shift: false,
    },
    mouse: {
      x: -1,
      y: -1,
      click: false,
    },
  };
  const subs: {
    [id: string]: {
      type: InputServiceSubscriptionType;
      handler: InputServiceHandler;
    };
  } = {};

  function trigger(
    type: InputServiceSubscriptionType,
    event: KeyboardEvent | MouseEvent
  ) {
    for (const id in subs) {
      if (
        subs[id].type === InputServiceSubscriptionType.ALL ||
        subs[id].type === type
      ) {
        try {
        } catch (e) {
          console.error();
        }
        if (typeof (event as KeyboardEvent).key !== 'undefined') {
          subs[id].handler('k', state, event);
        } else {
          subs[id].handler('m', state, event);
        }
      }
    }
  }
  function setKeyboardCtl(key: string, value: boolean) {
    if (key === 'Ctrl') {
      state.keyboard.ctrl = value;
    } else if (key === 'Shift') {
      state.keyboard.shift = value;
    } else if (key === 'Alt') {
      state.keyboard.alt = value;
    } else {
      state.keyboard.key = key;
    }
  }

  window.addEventListener('keydown', (event) => {
    setKeyboardCtl(event.key, true);
    trigger(InputServiceSubscriptionType.KEY_DOWN, event);
  });
  window.addEventListener('keyup', (event) => {
    setKeyboardCtl(event.key, false);
    trigger(InputServiceSubscriptionType.KEY_UP, event);
  });
  window.addEventListener('mousedown', (event) => {
    state.mouse.click = true;
    state.mouse.x = event.clientX;
    state.mouse.y = event.clientY;
    trigger(InputServiceSubscriptionType.MOUSE_DOWN, event);
  });
  window.addEventListener('mouseup', (event) => {
    state.mouse.click = false;
    state.mouse.x = event.clientX;
    state.mouse.y = event.clientY;
    trigger(InputServiceSubscriptionType.MOUSE_UP, event);
  });
  window.addEventListener('mousemove', (event) => {
    state.mouse.x = event.clientX;
    state.mouse.y = event.clientY;
    trigger(InputServiceSubscriptionType.MOUSE_MOVE, event);
  });

  const self: InputServicePrototype = {
    subscribe(type, handler) {
      const id = uuidv4();
      subs[id] = { type, handler };
      return () => {
        delete subs[id];
      };
    },
  };
  return self;
}
