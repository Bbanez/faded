import { createFS } from '@banez/fs';
import { Repo } from '@backend/repo';
import {
  RouteProtection,
  RouteProtectionBodyCheckAndJwtResult,
  RouteProtectionJwtResult,
} from '@backend/security';
import type {
  ControllerItemResponse,
  ControllerItemsResponse,
} from '@backend/types';
import { Query } from '@backend/util';
import type { ObjectSchema } from '@banez/object-utility/types';
import { createController, createControllerMethod, HttpStatus } from 'servaljs';
import { UserFactory } from './factory';
import type { UserProtected, UserPublic } from './models';

export interface UserUpdateBody {
  username?: string;
}
export const UserUpdateBodySchema: ObjectSchema = {
  username: {
    __type: 'string',
    __required: false,
  },
};

export interface UserSearchBody {
  term: string;
}
export const UserSearchBodySchema: ObjectSchema = {
  term: {
    __type: 'string',
    __required: true,
  },
};

export const UserController = createController({
  name: 'User',
  path: '/api/v1/user',
  methods() {
    return {
      getAll: createControllerMethod<
        RouteProtectionJwtResult,
        ControllerItemsResponse<UserPublic>
      >({
        path: '/all',
        type: 'get',
        preRequestHandler: RouteProtection.createJwtCheck(),
        async handler({ request }) {
          const limits = Query.getLimitAndOffset(request.query);
          const users = await Repo.user.methods.findAll(
            limits.limit,
            limits.offset,
          );
          return {
            items: users.map((e) => UserFactory.toPublic(e)),
            limit: limits.limit,
            offset: limits.offset,
            total: await Repo.user.count(),
          };
        },
      }),

      getMe: createControllerMethod<
        RouteProtectionJwtResult,
        ControllerItemResponse<UserProtected>
      >({
        path: '/me',
        type: 'get',
        preRequestHandler: RouteProtection.createJwtCheck(),
        async handler({ token, errorHandler }) {
          const user = await Repo.user.findById(token.payload.userId);
          if (!user) {
            throw errorHandler(
              HttpStatus.InternalServerError,
              `Failed to find user "${token.payload.userId}"`,
            );
          }
          return {
            item: user,
          };
        },
      }),

      getFriends: createControllerMethod<
        RouteProtectionJwtResult,
        ControllerItemsResponse<UserPublic>
      >({
        path: '/friends',
        type: 'get',
        preRequestHandler: RouteProtection.createJwtCheck(),
        async handler({ token, errorHandler }) {
          const user = await Repo.user.findById(token.payload.userId);
          if (!user) {
            throw errorHandler(
              HttpStatus.InternalServerError,
              `User "${token.payload.userId}" does not exist.`,
            );
          }
          const users = await Repo.user.findAllBy({
            friends: { $in: user.friends },
          });
          return {
            items: users.map((e) => UserFactory.toPublic(e)),
            total: users.length,
            limit: users.length,
            offset: 0,
          };
        },
      }),

      getById: createControllerMethod<
        RouteProtectionJwtResult,
        ControllerItemResponse<UserPublic>
      >({
        path: '/:id',
        type: 'get',
        preRequestHandler: RouteProtection.createJwtCheck(),
        async handler({ request, errorHandler }) {
          const params: any = request.params;
          const user = await Repo.user.findById('' + params.id);
          if (!user) {
            throw errorHandler(
              HttpStatus.NotFound,
              `User "${params.id}" does not exist.`,
            );
          }
          return {
            item: UserFactory.toPublic(user),
          };
        },
      }),

      checkUsername: createControllerMethod<
        RouteProtectionJwtResult,
        { ok: boolean }
      >({
        path: '/check-username/:username',
        type: 'get',
        preRequestHandler: RouteProtection.createJwtCheck(),
        async handler({ request }) {
          const params: any = request.params;
          const user = await Repo.user.methods.findByUsername(
            '' + params.username,
          );
          return { ok: !!user };
        },
      }),

      getAvatar: createControllerMethod<void, any>({
        path: '/avatar/:filename',
        type: 'get',
        async handler({ request, replay }) {
          const params = request.params as any;
          return replay.sendFile(`avatar/${params.filename}`);
        },
      }),

      uploadAvatar: createControllerMethod<
        RouteProtectionJwtResult,
        ControllerItemResponse<UserProtected>
      >({
        path: '/upload-avatar',
        type: 'post',
        preRequestHandler: RouteProtection.createJwtCheck(),
        async handler({ request, token, errorHandler }) {
          let user = await Repo.user.findById(token.payload.userId);
          if (!user) {
            throw errorHandler(
              HttpStatus.InternalServerError,
              `User "${token.payload.userId}" does not exist.`,
            );
          }
          const data = await request.file({
            limits: {
              fileSize: 1024 * 1024,
            },
          });
          if (!data) {
            throw errorHandler(HttpStatus.BadRequest, 'Missing an image.');
          }
          if (!data.mimetype.startsWith('image/')) {
            throw errorHandler(HttpStatus.BadRequest, 'File must be an image.');
          }
          try {
            const buffer = await data.toBuffer();
            const fs = createFS({
              base: process.cwd(),
            });
            await fs.save(['uploads', 'avatar', user._id], buffer);
            user.image = `/api/v1/user/avatar/${user._id}?v=${Date.now()}`;
          } catch (error) {
            const err = error as Error;
            throw errorHandler(HttpStatus.BadRequest, err.message);
          }
          user = await Repo.user.update(user);
          return {
            item: UserFactory.toProtected(user),
          };
        },
      }),

      update: createControllerMethod<
        RouteProtectionBodyCheckAndJwtResult<UserUpdateBody>,
        ControllerItemResponse<UserProtected>
      >({
        type: 'put',
        preRequestHandler: RouteProtection.createJwtAndBodyCheck({
          schema: UserUpdateBodySchema,
        }),
        async handler({ body, token, errorHandler }) {
          let user = await Repo.user.findById(token.payload.userId);
          if (!user) {
            throw errorHandler(
              HttpStatus.InternalServerError,
              `User "${token.payload.userId}" does not exist.`,
            );
          }
          let shouldUpdate = false;
          if (body.username) {
            shouldUpdate = true;
            const username = body.username.replace(/[^a-z0-9]/g, '');
            const existingUser = await Repo.user.methods.findByUsername(
              username,
            );
            if (existingUser) {
              throw errorHandler(
                HttpStatus.BadRequest,
                `Username "${username}" is already taken.`,
              );
            }
            user.username = username;
          }
          if (shouldUpdate) {
            if (!user.setupDone) {
              user.setupDone = true;
            }
            user = await Repo.user.update(user);
          }
          return {
            item: UserFactory.toProtected(user),
          };
        },
      }),

      search: createControllerMethod<
        RouteProtectionBodyCheckAndJwtResult<UserSearchBody>,
        ControllerItemsResponse<UserPublic>
      >({
        path: '/search',
        type: 'post',
        preRequestHandler: RouteProtection.createJwtAndBodyCheck({
          schema: UserSearchBodySchema,
        }),
        async handler({ body }) {
          const users = await Repo.user.methods.findAllBySearch(body.term);
          return {
            items: users.map((e) => UserFactory.toPublic(e)),
            limit: users.length,
            offset: 0,
            total: users.length,
          };
        },
      }),
    };
  },
});
