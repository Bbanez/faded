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
import type { ObjectSchema } from '@banez/object-utility/types';
import { createController, createControllerMethod, HttpStatus } from 'servaljs';
import { UserInvitationFactory } from './factory';
import type { UserInvitation } from './models';

export interface UserInvitationCreateBody {
  userId: string;
}
export const UserInvitationCreateBodySchema: ObjectSchema = {
  userId: {
    __type: 'string',
    __required: true,
  },
};

export const UserInvitationController = createController({
  name: 'User invitation',
  path: '/api/v1/user-invitation',
  methods() {
    return {
      getAll: createControllerMethod<
        RouteProtectionJwtResult,
        ControllerItemsResponse<UserInvitation>
      >({
        path: '/all',
        type: 'get',
        preRequestHandler: RouteProtection.createJwtCheck(),
        async handler({ token }) {
          const invs = [
            ...(await Repo.userInvitation.methods.findAllByTo(
              token.payload.userId,
            )),
            ...(await Repo.userInvitation.methods.findAllByFrom(
              token.payload.userId,
            )),
          ];
          return {
            items: invs,
            total: invs.length,
            limit: invs.length,
            offset: 0,
          };
        },
      }),

      create: createControllerMethod<
        RouteProtectionBodyCheckAndJwtResult<UserInvitationCreateBody>,
        ControllerItemResponse<UserInvitation>
      >({
        type: 'post',
        preRequestHandler: RouteProtection.createJwtAndBodyCheck({
          schema: UserInvitationCreateBodySchema,
        }),
        async handler({ token, body, errorHandler }) {
          const user = await Repo.user.findById(token.payload.userId);
          if (!user) {
            throw errorHandler(
              HttpStatus.InternalServerError,
              `User "${token.payload.userId}" does not exist.`,
            );
          }
          if (user.friends.includes(body.userId)) {
            throw errorHandler(
              HttpStatus.Forbidden,
              `This user is already your friend.`,
            );
          }
          const toUser = await Repo.user.findById(body.userId);
          if (!toUser) {
            throw errorHandler(
              HttpStatus.InternalServerError,
              `To user "${token.payload.userId}" does not exist.`,
            );
          }
          if (toUser.blockedUsers.includes(user._id)) {
            throw errorHandler(
              HttpStatus.Forbidden,
              'You are blocked by this user. You cannot invite them.',
            );
          }
          let inv = await Repo.userInvitation.methods.findByFromAndTo(
            user._id,
            toUser._id,
          );
          if (inv) {
            throw errorHandler(
              HttpStatus.Forbidden,
              `You already invited this user.`,
            );
          }
          inv = await Repo.userInvitation.methods.findByFromAndTo(
            toUser._id,
            user._id,
          );
          if (inv) {
            throw errorHandler(
              HttpStatus.Forbidden,
              `You are already invited by this user. Please accept the invitation.`,
            );
          }
          inv = await Repo.userInvitation.add(
            UserInvitationFactory.create({
              from: user._id,
              to: toUser._id,
              status: 'pending',
            }),
          );
          return {
            item: inv,
          };
        },
      }),

      accept: createControllerMethod<RouteProtectionJwtResult, { ok: true }>({
        path: '/accept/:invId',
        type: 'post',
        preRequestHandler: RouteProtection.createJwtCheck(),
        async handler({ token, request, errorHandler }) {
          const params = request.params as any;
          const inv = await Repo.userInvitation.methods.findByIdAndTo(
            params.invId,
            token.payload.userId,
          );
          if (!inv) {
            throw errorHandler(
              HttpStatus.NotFound,
              `Invitation "${params.invId}" does not exist`,
            );
          }
          const fromUser = await Repo.user.findById(inv.from);
          if (!fromUser) {
            throw errorHandler(
              HttpStatus.InternalServerError,
              `From user "${inv.from}" does not exist.`,
            );
          }
          const toUser = await Repo.user.findById(inv.to);
          if (!toUser) {
            throw errorHandler(
              HttpStatus.InternalServerError,
              `To user "${inv.from}" does not exist.`,
            );
          }
          fromUser.friends = fromUser.friends.filter((e) => e !== toUser._id);
          fromUser.friends.push(toUser._id);
          toUser.friends = toUser.friends.filter((e) => e !== fromUser._id);
          toUser.friends.push(fromUser._id);
          await Repo.user.update(fromUser);
          await Repo.user.update(toUser);
          return { ok: true };
        },
      }),
    };
  },
});
