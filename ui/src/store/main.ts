import { FddMapEntryMeta } from '@backend/bcms-types';
import type { UserProtected, UserPublic } from '@backend/user';
import { UserInvitation } from '@backend/user-invitation';
import { createArrayStore } from '@banez/vue-array-store';
import { useApi } from '@ui/api';

export class Store {
  user = createArrayStore<
    UserPublic,
    {
      me(): UserProtected | null;
    }
  >('_id', [], (store) => {
    return {
      me() {
        const api = useApi();
        if (api.accessToken) {
          return store.findById(
            api.accessToken.payload.userId,
          ) as UserProtected;
        }
        return null;
      },
    };
  });

  userInvitation = createArrayStore<UserInvitation>('_id', []);

  map = createArrayStore<FddMapEntryMeta>('slug', []);
}

let store: Store;

export function useStore() {
  if (!store) {
    store = new Store();
  }
  return store;
}
