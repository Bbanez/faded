import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import type { ObjectSchema } from '@banez/object-utility/types';
import {
  createController,
  createControllerMethod,
} from '@becomes/purple-cheetah';
import {
  JWTPermissionName,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { HTTPStatus } from '@becomes/purple-cheetah/types';
import { Repo } from '@faded/repo';
import { responseCode } from '@faded/response-code';
import {
  RouteProtection,
  RouteProtectionBodyCheckResult,
  RouteProtectionJWTResult,
} from '@faded/security';
import { UserFactory } from './factory';
import type { UserProtected } from './models';
import { EmailSender } from '@faded/email';
import { UserService } from './service';

interface SignUpBody {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  username: string;
}
const SignUpBodySchema: ObjectSchema = {
  email: {
    __type: 'string',
    __required: true,
  },
  password: {
    __type: 'string',
    __required: true,
  },
  firstName: {
    __type: 'string',
    __required: true,
  },
  lastName: {
    __type: 'string',
    __required: true,
  },
  username: {
    __type: 'string',
    __required: true,
  },
};

export const UserController = createController({
  name: 'User',
  path: '/api/user',
  methods() {
    return {
      signUp: createControllerMethod<
        RouteProtectionBodyCheckResult<SignUpBody>,
        { ok: boolean }
      >({
        path: '/sign-up',
        type: 'post',
        preRequestHandler: RouteProtection.bodyCheck(SignUpBodySchema),
        async handler({ body, errorHandler, logger }) {
            Repo  
          const userWithSameEmail = await Repo.user.methods.findByEmail(
            body.email,
          );
          if (userWithSameEmail) {
            logger.warn(
              'sign-up',
              `User with email "${body.email}" already exists.`,
            );
            return {
              ok: true,
            };
          }
          const userWithSameUsername = await Repo.user.methods.findByUsername(
            body.username,
          );
          if (userWithSameUsername) {
            throw errorHandler.occurred(
              HTTPStatus.FORBIDDEN,
              responseCode('u002', { username: body.username }),
            );
          }
          const user = await Repo.user.add(
            UserFactory.instance({
              email: body.email,
              username: body.username,
              password: await bcrypt.hash(body.password, 10),
              personal: {
                firstName: body.firstName,
                lastName: body.lastName,
                avatarUri: '',
              },
              refreshTokens: [],
              verified: false,
              roles: [
                {
                  name: JWTRoleName.USER,
                  permissions: [
                    {
                      name: JWTPermissionName.READ,
                    },
                    {
                      name: JWTPermissionName.WRITE,
                    },
                    {
                      name: JWTPermissionName.DELETE,
                    },
                    {
                      name: JWTPermissionName.EXECUTE,
                    },
                  ],
                },
              ],
            }),
          );

          const error = await EmailSender.verifyAccount({
            email: user.email,
            username: user.username,
            firstName: user.personal.firstName,
            lastName: user.personal.lastName,
            query: Buffer.from(
              JSON.stringify({ userId: user._id, otp: user.otp }),
            ).toString('hex'),
          });
          if (error) {
            await Repo.user.deleteById(user._id);
            throw errorHandler.occurred(
              HTTPStatus.FORBIDDEN,
              responseCode('u026'),
            );
          }
          return {
            ok: true,
          };
        },
      }),

      signUpComplete: createControllerMethod<
        RouteProtectionBodyCheckResult<{ userId: string; otp: string }>,
        { ok: boolean }
      >({
        path: '/sign-up/complete',
        type: 'post',
        preRequestHandler: RouteProtection.bodyCheck({
          userId: {
            __type: 'string',
            __required: true,
          },
          otp: {
            __type: 'string',
            __required: true,
          },
        }),
        async handler({ body, errorHandler }) {
          const user = await Repo.user.findById(body.userId);
          if (!user) {
            throw errorHandler.occurred(
              HTTPStatus.BAD_REQUEST,
              responseCode('u004', { id: body.userId }),
            );
          }
          UserService.checkBlocked(user, errorHandler);
          if (user.otp !== body.otp) {
            user.blockedTo = Date.now() + 60000;
            await Repo.user.update(user);
            const date = new Date(user.blockedTo);
            throw errorHandler.occurred(
              HTTPStatus.FORBIDDEN,
              responseCode('u006', {
                date: `${date.getFullYear()}/${
                  date.getMonth() + 1
                }/${date.getDate()} ${date.getHours()}:${date.getMinutes()} UTC`,
              }),
            );
          }
          user.otp = crypto.randomBytes(64).toString('hex');
          user.verified = true;
          await Repo.user.update(user);
          return {
            ok: true,
          };
        },
      }),

      checkUsername: createControllerMethod<
        RouteProtectionBodyCheckResult<{ username: string }>,
        { available: boolean }
      >({
        path: '/check-username',
        type: 'post',
        preRequestHandler: RouteProtection.bodyCheck({
          username: {
            __type: 'string',
            __required: true,
          },
        }),
        async handler({ body }) {
          const user = await Repo.user.methods.findByUsername(body.username);
          return {
            available: !user,
          };
        },
      }),

      getAll: createControllerMethod<
        RouteProtectionJWTResult,
        {
          items: UserProtected[];
          limit: number;
          offset: number;
          pages: number;
        }
      >({
        path: '/all',
        type: 'get',
        preRequestHandler: RouteProtection.jwt(),
        async handler({ request }) {
          let limit = 20;
          let offset = 0;
          const search = request.query.search as string;
          if (request.query.limit) {
            limit = parseInt(request.query.limit as string);
            if (isNaN(limit) || limit > 20) {
              limit = 20;
            }
          }
          if (request.query.limit) {
            offset = parseInt(request.query.offset as string);
            if (isNaN(offset)) {
              offset = 0;
            }
          }
          if (!search || search.length < 3) {
            return {
              items: [],
              limit,
              offset,
              pages: 0,
            };
          }
          const result = await Repo.user.methods.search(search, limit, offset);
          return {
            items: result.users,
            limit,
            offset,
            pages: parseInt((result.count / limit).toFixed(0)),
          };
        },
      }),

      get: createControllerMethod<
        RouteProtectionJWTResult,
        { item: UserProtected }
      >({
        path: '/:query',
        type: 'get',
        preRequestHandler: RouteProtection.jwt(),
        async handler({ jwt, errorHandler, request }) {
          const idOrUsername =
            request.params.query === 'me'
              ? jwt.payload.userId
              : request.params.query;
          const user = await Repo.user.methods.findByIdOrUsername(idOrUsername);
          if (!user) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              responseCode('u001', { id: idOrUsername }),
            );
          }
          return {
            item: UserFactory.toProtected(user),
          };
        },
      }),
    };
  },
});
