import { v4 as uuidv4 } from 'uuid';
import type {
  InputServiceHandler,
  InputServicePrototype,
  InputServiceState,
} from '../types';
import { InputServiceSubscriptionType } from '../types';

export function InputService(): InputServicePrototype {
  const st: InputServiceState = {
    keyboard: {
      key: '',
      alt: false,
      ctrl: false,
      shift: false,
      a: false,
      s: false,
      d: false,
      w: false,
    },
    mouse: {
      x: -1,
      y: -1,
      click: {
        left: false,
        middle: false,
        right: false,
      },
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
          if (typeof (event as KeyboardEvent).key !== 'undefined') {
            subs[id].handler('k', st, event);
          } else {
            subs[id].handler('m', st, event);
          }
        } catch (e) {
          window.t.services.console.error({ payload: e });
        }
      }
    }
  }
  function setKeyboardCtl(key: string, value: boolean) {
    if (key === 'Ctrl') {
      st.keyboard.ctrl = value;
    } else if (key === 'Shift') {
      st.keyboard.shift = value;
    } else if (key === 'Alt') {
      st.keyboard.alt = value;
    } else {
      st.keyboard.key = key;
      switch (key) {
        case 'a':
          {
            st.keyboard.a = value;
          }
          break;
        case 's':
          {
            st.keyboard.s = value;
          }
          break;
        case 'd':
          {
            st.keyboard.d = value;
          }
          break;
        case 'w':
          {
            st.keyboard.w = value;
          }
          break;
      }
    }
  }
  function setMouseCtl(event: MouseEvent, value: boolean) {
    if (event.button === 0) {
      st.mouse.click.left = value;
    } else if (event.button === 1) {
      st.mouse.click.middle = value;
    } else if (event.button === 2) {
      st.mouse.click.right = value;
    }
    st.mouse.x = event.clientX;
    st.mouse.y = event.clientY;
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
    setMouseCtl(event, true);
    trigger(InputServiceSubscriptionType.MOUSE_DOWN, event);
  });
  window.addEventListener('mouseup', (event) => {
    setMouseCtl(event, false);
    trigger(InputServiceSubscriptionType.MOUSE_UP, event);
  });
  window.addEventListener('mousemove', (event) => {
    st.mouse.x = event.clientX;
    st.mouse.y = event.clientY;
    trigger(InputServiceSubscriptionType.MOUSE_MOVE, event);
  });
  window.addEventListener('contextmenu', (event) => {
    event.preventDefault();
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
