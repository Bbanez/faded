import type { ConsoleServicePrototype } from '../types';

export function ConsoleService(): ConsoleServicePrototype {
  const self: ConsoleServicePrototype = {
    info(data) {
      console.log(JSON.stringify(data, null, ' '));
    },
    warn(data) {
      console.warn(JSON.stringify(data, null, ' '));
    },
    error(data) {
      console.error(JSON.stringify(data, null, ' '));
    },
  };
  return self;
}
