import { responseCode } from '@backend/response-code';
import type { UserJwt, UserJwtProps } from '@backend/user';
import { ObjectUtility } from '@banez/object-utility';
import { ObjectSchema, ObjectUtilityError } from '@banez/object-utility/types';
import {
  ControllerMethodPreRequestHandler,
  HttpErrorHandler,
  HttpStatus,
} from 'servaljs';
import { JWTError, JWTManager } from 'servaljs-jwt';

export interface RouteProtectionBodyCheckResult<Body> {
  body: Body;
}

export interface RouteProtectionJwtResult {
  token: UserJwt;
}

export type RouteProtectionBodyCheckAndJwtResult<Body> =
  RouteProtectionBodyCheckResult<Body> & RouteProtectionJwtResult;

export class RouteProtection {
  static createBodyCheck<Body = any>(
    schema: ObjectSchema,
  ): ControllerMethodPreRequestHandler<RouteProtectionBodyCheckResult<Body>> {
    return async ({ errorHandler, request }) => {
      const bodyCheck = ObjectUtility.compareWithSchema(
        request.body,
        schema,
        'body',
      );
      if (bodyCheck instanceof ObjectUtilityError) {
        throw errorHandler(
          HttpStatus.Forbidden,
          responseCode('general001', bodyCheck.message),
        );
      }
      return { body: request.body as Body };
    };
  }

  static verifyAccess(config: {
    token: string;
    errorHandler: HttpErrorHandler;
  }): UserJwt {
    const token = JWTManager.get<UserJwtProps>({
      token: config.token,
      roles: ['USER', 'ADMIN'],
    });
    if (token instanceof JWTError) {
      throw config.errorHandler(HttpStatus.Forbidden, token.message);
    }
    return token;
  }

  static createJwtCheck(): ControllerMethodPreRequestHandler<RouteProtectionJwtResult> {
    return async ({ errorHandler, request }) => {
      return {
        token: RouteProtection.verifyAccess({
          errorHandler,
          token: request.headers.authorization
            ? request.headers.authorization.replace('Bearer ', '')
            : '',
        }),
      };
    };
  }

  static createJwtAndBodyCheck<Body = unknown>(config: {
    schema: ObjectSchema;
  }): ControllerMethodPreRequestHandler<
    RouteProtectionBodyCheckAndJwtResult<Body>
  > {
    return async ({ request, errorHandler }) => {
      const bodyCheck = ObjectUtility.compareWithSchema(
        request.body,
        config.schema,
        'body',
      );
      if (bodyCheck instanceof ObjectUtilityError) {
        throw errorHandler(
          HttpStatus.Forbidden,
          responseCode('general001', bodyCheck.message),
        );
      }
      return {
        body: request.body as Body,
        token: RouteProtection.verifyAccess({
          errorHandler,
          token: request.headers.authorization
            ? request.headers.authorization.replace('Bearer ', '')
            : '',
        }),
      };
    };
  }
}
