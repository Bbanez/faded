import { ObjectUtility } from '@banez/object-utility';
import { ObjectSchema, ObjectUtilityError } from '@banez/object-utility/types';
import { useJwt } from '@becomes/purple-cheetah-mod-jwt';
import {
  JWT,
  JWTError,
  JWTPermissionName,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import {
  ControllerMethodPreRequestHandler,
  HTTPStatus,
} from '@becomes/purple-cheetah/types';
import type { UserPersonal } from '@faded/user';

export interface JWTProps {
  personal: UserPersonal;
  email: string;
}

export interface RouteProtectionJWTResult {
  jwt: JWT<JWTProps>;
}

export interface RouteProtectionJWTAndBodyCheckResult<Body = unknown> {
  jwt: JWT<JWTProps>;
  body: Body;
}

export interface RouteProtectionBodyCheckResult<Body = unknown> {
  body: Body;
}

export class RouteProtection {
  static jwt(config?: {
    roles: JWTRoleName[];
    permission: JWTPermissionName;
  }): ControllerMethodPreRequestHandler<RouteProtectionJWTResult> {
    if (!config) {
      config = {
        roles: [JWTRoleName.ADMIN, JWTRoleName.USER],
        permission: JWTPermissionName.READ,
      };
    }
    const jwt = useJwt();
    return async (data) => {
      const result = jwt.get<JWTProps>({
        jwtString: data.request.headers.authorization as string,
        permissionName: config ? config.permission : JWTPermissionName.READ,
        roleNames: config ? config.roles : [JWTRoleName.SUDO],
      });
      if (result instanceof JWTError) {
        throw data.errorHandler.occurred(
          HTTPStatus.UNAUTHORIZED,
          result.message,
        );
      }
      return {
        jwt: result,
      };
    };
  }

  static jwtAndBodyCheck<Body = unknown>(config: {
    roles?: JWTRoleName[];
    permission?: JWTPermissionName;
    bodySchema: ObjectSchema;
  }): ControllerMethodPreRequestHandler<
    RouteProtectionJWTAndBodyCheckResult<Body>
  > {
    const jwt = useJwt();
    return async (data) => {
      const result = jwt.get<JWTProps>({
        jwtString: data.request.headers.authorization as string,
        permissionName: config.permission
          ? config.permission
          : JWTPermissionName.READ,
        roleNames: config.roles ? config.roles : [JWTRoleName.SUDO],
      });
      if (result instanceof JWTError) {
        throw data.errorHandler.occurred(
          HTTPStatus.UNAUTHORIZED,
          result.message,
        );
      }
      const bodyCheck = ObjectUtility.compareWithSchema(
        data.request.body,
        config.bodySchema,
        'body',
      );
      if (bodyCheck instanceof ObjectUtilityError) {
        throw data.errorHandler.occurred(
          HTTPStatus.BAD_REQUEST,
          bodyCheck.message,
        );
      }
      return {
        jwt: result,
        body: data.request.body,
      };
    };
  }

  static bodyCheck<Body = unknown>(
    schema: ObjectSchema,
  ): ControllerMethodPreRequestHandler<RouteProtectionBodyCheckResult<Body>> {
    return async (data) => {
      const bodyCheck = ObjectUtility.compareWithSchema(
        data.request.body,
        schema,
        'body',
      );
      if (bodyCheck instanceof ObjectUtilityError) {
        throw data.errorHandler.occurred(
          HTTPStatus.BAD_REQUEST,
          bodyCheck.message,
        );
      }
      return {
        body: data.request.body,
      };
    };
  }
}
