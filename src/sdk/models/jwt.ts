export interface JWTPermission {
  name: string;
}

export interface JWTRole {
  name: string;
  permissions: JWTPermission[];
}
