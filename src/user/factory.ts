import * as crypto from 'crypto';
import {
  JWTPermissionName,
  JWTRole,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { Types } from 'mongoose';
import type {
  User,
  UserPersonal,
  UserProtected,
  UserRefreshToken,
} from './models';

export class UserFactory {
  static instance(data: {
    username?: string;
    email?: string;
    password?: string;
    roles?: JWTRole[];
    refreshTokens?: UserRefreshToken[];
    personal?: UserPersonal;
    verified?: boolean;
    otp?: string;
    blockedTo?: number;
    permBlock?: boolean;
  }): User {
    return {
      _id: `${new Types.ObjectId()}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      email: data.email || '',
      password: data.password || '',
      personal: data.personal || {
        avatarUri: '',
        firstName: '',
        lastName: '',
      },
      refreshTokens: data.refreshTokens || [],
      username: data.username || '',
      verified: data.verified || false,
      otp: data.otp || crypto.randomBytes(64).toString('base64'),
      roles: data.roles || [
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
      blockedTo: data.blockedTo || 0,
      permBlock: data.permBlock || false,
    };
  }

  static toProtected(user: User): UserProtected {
    return {
      _id: user._id,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      email: user.email,
      username: user.username,
      personal: user.personal,
      roles: user.roles,
      verified: user.verified,
    };
  }
}
