import { createArrayStore } from '@banez/vue-array-store';
import type { ArrayStore } from '@banez/vue-array-store/types';
import { SDK } from '@client/sdk/main';
import type { UserStoreMethods } from './types';
import type { User } from '@faded/user/models';

export function createUserStore(): ArrayStore<User, UserStoreMethods> {
  return createArrayStore<User, UserStoreMethods>('_id', [], (store) => {
    return {
      me() {
        const at = SDK.accessToken;
        if (!at) {
          return null;
        }
        return store.findById(at.payload.userId);
      },
    };
  });
}
