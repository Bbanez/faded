import type { JWTRole } from "./jwt";
import type { Model } from "./_default";

export interface UserRefreshToken {
  value: string;
  expAt: number;
}

export interface UserPersonal {
  firstName: string;
  lastName: string;
  avatarUri: string;
}

export interface User extends Model {
  username: string;
  roles: JWTRole[];
  personal: UserPersonal;
}