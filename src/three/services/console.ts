import type { ConsoleServicePrototype } from '../types';

export function ConsoleService() {
  const self: ConsoleServicePrototype = {
    info(data) {
      console.log(data.payload);
    },
    warn(data) {
      console.warn(data.payload);
    },
    error(data) {
      console.error(data.payload);
    },
  };
  return self;
}
