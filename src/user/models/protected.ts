import type { FSDBEntity } from '@becomes/purple-cheetah-mod-fsdb/types';
import type { JWTRole } from '@becomes/purple-cheetah-mod-jwt/types';
import type { UserPersonal } from './personal';

export interface UserProtected extends FSDBEntity {
  username: string;
  email: string;
  roles: JWTRole[];
  personal: UserPersonal;
  verified: boolean;
}
