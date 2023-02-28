import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import type { ObjectSchema } from '@banez/object-utility/types';
import {
  createController,
  createControllerMethod,
} from '@becomes/purple-cheetah';
import { useJwt, useJwtEncoding } from '@becomes/purple-cheetah-mod-jwt';
import { HTTPStatus } from '@becomes/purple-cheetah/types';
import { Repo } from '@faded/repo';
import { responseCode } from '@faded/response-code';
import {
  JWTProps,
  RouteProtection,
  RouteProtectionBodyCheckResult,
} from '@faded/security';
import { UserRefreshToken, UserService } from '@faded/user';
import { Config } from '@faded/config';
import { JWTError } from '@becomes/purple-cheetah-mod-jwt/types';

interface LoginBody {
  email: string;
  password: string;
}
const LoginBodySchema: ObjectSchema = {
  email: {
    __type: 'string',
    __required: true,
  },

  password: {
    __type: 'string',
    __required: true,
  },
};

export const AuthController = createController({
  name: 'Auth',
  path: '/api/auth',
  methods() {
    const jwtManager = useJwt();
    const jwtEncoder = useJwtEncoding();
    return {
      login: createControllerMethod<
        RouteProtectionBodyCheckResult<LoginBody>,
        { accessToken: string; refreshToken: string }
      >({
        path: '/login',
        type: 'post',
        preRequestHandler:
          RouteProtection.bodyCheck<LoginBody>(LoginBodySchema),
        async handler({ body, errorHandler }) {
          const user = await Repo.user.methods.findByEmail(body.email);
          if (!user) {
            throw errorHandler.occurred(
              HTTPStatus.FORBIDDEN,
              responseCode('a003'),
            );
          }
          if (!user.verified) {
            throw errorHandler.occurred(
              HTTPStatus.FORBIDDEN,
              responseCode('a007'),
            );
          }
          UserService.checkBlocked(user, errorHandler);
          const checkPassword = await bcrypt.compare(
            body.password,
            user.password,
          );
          if (!checkPassword) {
            throw errorHandler.occurred(
              HTTPStatus.FORBIDDEN,
              responseCode('a003'),
            );
          }
          user.refreshTokens = user.refreshTokens.filter(
            (e) => e.expAt > Date.now(),
          );
          const rt: UserRefreshToken = {
            expAt: Date.now() + 2592000000,
            value: crypto
              .createHash('sha512')
              .update(Date.now() + crypto.randomBytes(16).toString())
              .digest('base64'),
          };
          user.refreshTokens.push(rt);
          const userId = user._id;
          const accessToken = jwtManager.create<JWTProps>({
            issuer: Config.jwt.issuer,
            roles: user.roles,
            userId,
            props: {
              email: user.email,
              personal: user.personal,
            },
          });
          if (accessToken instanceof JWTError) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              'Failed to create access token.',
            );
          }
          const updateUserResult = await Repo.user.update(user);
          if (!updateUserResult) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              responseCode('u010'),
            );
          }
          return {
            accessToken: jwtEncoder.encode(accessToken),
            refreshToken: `${user._id}.${rt.value}`,
          };
        },
      }),

      logout: createControllerMethod<
        RouteProtectionBodyCheckResult<{ token: string }>,
        { ok: boolean }
      >({
        path: '/logout',
        type: 'post',
        preRequestHandler: RouteProtection.bodyCheck({
          token: {
            __type: 'string',
            __required: true,
          },
        }),
        async handler({ errorHandler, body }) {
          const rtParts = body.token.split('.');
          if (rtParts.length !== 2) {
            throw errorHandler.occurred(
              HTTPStatus.FORBIDDEN,
              responseCode('a005'),
            );
          }
          const user = await Repo.user.methods.findByIdAndRefreshToken(
            rtParts[0],
            rtParts[1],
          );
          if (!user) {
            throw errorHandler.occurred(
              HTTPStatus.FORBIDDEN,
              responseCode('a005'),
            );
          }
          if (!user.verified) {
            throw errorHandler.occurred(
              HTTPStatus.FORBIDDEN,
              responseCode('a007'),
            );
          }
          user.refreshTokens = user.refreshTokens.filter(
            (e) => e.value !== rtParts[1] && e.expAt > Date.now(),
          );
          await Repo.user.update(user);
          return {
            ok: true,
          };
        },
      }),

      refreshAccess: createControllerMethod<
        RouteProtectionBodyCheckResult<{ token: string }>,
        { accessToken: string }
      >({
        path: '/refresh-access',
        type: 'post',
        preRequestHandler: RouteProtection.bodyCheck({
          token: {
            __type: 'string',
            __required: true,
          },
        }),
        async handler({ errorHandler, body }) {
          const rtParts = body.token.split('.');
          if (rtParts.length !== 2) {
            throw errorHandler.occurred(
              HTTPStatus.FORBIDDEN,
              responseCode('a005'),
            );
          }
          const user = await Repo.user.methods.findByIdAndRefreshToken(
            rtParts[0],
            rtParts[1],
          );
          if (!user) {
            throw errorHandler.occurred(
              HTTPStatus.FORBIDDEN,
              responseCode('a005'),
            );
          }
          if (!user.verified) {
            throw errorHandler.occurred(
              HTTPStatus.FORBIDDEN,
              responseCode('a007'),
            );
          }
          const newRts = user.refreshTokens.filter((e) => e.expAt > Date.now());
          const targetRt = user.refreshTokens.find(
            (e) => e.value === rtParts[1],
          );
          if (!targetRt) {
            throw errorHandler.occurred(
              HTTPStatus.FORBIDDEN,
              responseCode('a005'),
            );
          }
          if (newRts.length !== user.refreshTokens.length) {
            await Repo.user.update(user);
          }
          const userId = user._id;
          const accessToken = jwtManager.create<JWTProps>({
            issuer: Config.jwt.issuer,
            roles: user.roles,
            userId,
            props: {
              email: user.email,
              personal: user.personal,
            },
          });
          if (accessToken instanceof JWTError) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              'Failed to create access token.',
            );
          }
          return { accessToken: jwtEncoder.encode(accessToken) };
        },
      }),
    };
  },
});
