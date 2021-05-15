import { v4 as uuidv4 } from 'uuid';
import type {
  ErrorHandlerPrototype,
  ErrorManagerCallback,
  ErrorManagerPrototype,
} from '../types';
import { ErrorEventType } from '../types';

function errorManager(): ErrorManagerPrototype {
  const subs: {
    [id: string]: ErrorManagerCallback;
  } = {};

  return {
    subscribe(callback) {
      const id = uuidv4();
      subs[id] = callback;
      return () => {
        delete subs[id];
      };
    },
    trigger(type, event) {
      for (const id in subs) {
        subs[id](type, event);
      }
    },
  };
}
export function createErrorHandler(mainSource: string): ErrorHandlerPrototype {
  return {
    warn(place, ...args) {
      const msg = args
        .map((arg) => {
          if (typeof arg === 'object') {
            return JSON.stringify(arg, null, '  ');
          }
          return arg;
        })
        .join('\n');
      const err = Error(msg);
      console.warn(mainSource, place, args);
      ErrorManager.trigger(ErrorEventType.WARN, {
        mainSource,
        place,
        message: msg,
        jsError: err,
      });
    },
    break(place, ...args) {
      const msg = args
        .map((arg) => {
          if (typeof arg === 'object') {
            return JSON.stringify(arg, null, '  ');
          }
          return arg;
        })
        .join('\n');
      const err = Error(msg);
      ErrorManager.trigger(ErrorEventType.WARN, {
        mainSource,
        place,
        message: msg,
        jsError: err,
      });
      return err;
    },
  };
}
export const ErrorManager = errorManager();
