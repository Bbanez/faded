import { ObjectUtility } from '@banez/object-utility';
import { ObjectSchema, ObjectUtilityError } from '@banez/object-utility/types';
import { createJwtProtectionPreRequestHandler } from '@becomes/purple-cheetah-mod-jwt';
import {
  JWT,
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
    const handler = createJwtProtectionPreRequestHandler<JWTProps>(
      config.roles,
      config.permission,
    );
    return async (data) => {
      const result = await handler(data);
      return {
        jwt: result.accessToken,
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
    const handler = createJwtProtectionPreRequestHandler<JWTProps>(
      config.roles || [JWTRoleName.ADMIN, JWTRoleName.USER],
      config.permission || JWTPermissionName.READ,
    );
    return async (data) => {
      const result = await handler(data);
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
        jwt: result.accessToken,
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
