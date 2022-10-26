import { createArrayStore } from '@banez/vue-array-store';
import type { ArrayStore } from '@banez/vue-array-store/types';
import type { Sdk } from '../main';
import type { User } from '../models';
import type { UserStoreMethods } from './types';

export function createUserStore(sdk: Sdk): ArrayStore<User, UserStoreMethods> {
  return createArrayStore<User, UserStoreMethods>([], (store) => {
    return {
      me() {
        const at = sdk.accessToken;
        if (!at) {
          return null;
        }
        return store.findById(at.payload.userId);
      },
    };
  });
}

export const userStore = createArrayStore<User, UserStoreMethods>(
  [],
  (store) => {
    return {
      me() {
        return store.items()[0];
      },
    };
  },
);
