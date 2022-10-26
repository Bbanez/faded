import type { Store } from './types';
import { userStore } from './user';

export function createStore(): Store {
  return {
    user: userStore,
  };
}
