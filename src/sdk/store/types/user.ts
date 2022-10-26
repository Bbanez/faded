import type { ArrayStore } from '@banez/vue-array-store/types';
import type { User } from '../../models';

export interface UserStoreMethods {
  me(): User | null;
}

export type UserStore = ArrayStore<User, UserStoreMethods>;
