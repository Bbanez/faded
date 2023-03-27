import type { JWTRole, UserPersonal } from '../models';

export interface JwtHeader {
  type: string;
  alg: 'HS256';
}

export interface JwtProps {
  email: string;
  personal: UserPersonal;
}

export interface JwtPayload {
  jti: string;
  iss: string;
  iat: number;
  exp: number;
  userId: string;
  rls: JWTRole[];
  props: JwtProps;
}

export interface Jwt {
  header: JwtHeader;
  payload: JwtPayload;
  signature: string;
}
