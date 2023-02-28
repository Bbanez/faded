import {
  FSDBEntity,
  FSDBEntitySchema,
} from '@becomes/purple-cheetah-mod-fsdb/types';
import { JWTRole, JWTRoleSchema } from '@becomes/purple-cheetah-mod-jwt/types';
import { MongoDBEntitySchemaString } from '@becomes/purple-cheetah-mod-mongodb/types';
import type { ObjectSchema } from '@becomes/purple-cheetah/types';
import { Schema } from 'mongoose';
import {
  UserPersonal,
  UserPersonalFSDBSchema,
  UserPersonalMongoDBSchema,
} from './personal';
import {
  UserRefreshToken,
  UserRefreshTokenFSDBSchema,
  UserRefreshTokenMongoDBSchema,
} from './refresh-token';

export interface User extends FSDBEntity {
  username: string;
  email: string;
  password: string;
  roles: JWTRole[];
  refreshTokens: UserRefreshToken[];
  personal: UserPersonal;
  verified: boolean;
  otp: string;
  blockedTo: number;
  permBlock: boolean;
}

export const UserFSDBSchema: ObjectSchema = {
  ...FSDBEntitySchema,
  username: {
    __type: 'string',
    __required: true,
  },
  email: {
    __type: 'string',
    __required: true,
  },
  password: {
    __type: 'string',
    __required: true,
  },
  roles: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'object',
      __content: JWTRoleSchema,
    },
  },
  refreshTokens: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'object',
      __content: UserRefreshTokenFSDBSchema,
    },
  },
  personal: {
    __type: 'object',
    __required: true,
    __child: UserPersonalFSDBSchema,
  },
  verified: {
    __type: 'boolean',
    __required: true,
  },
  otp: {
    __type: 'string',
    __required: true,
  },
  blockedTo: {
    __type: 'number',
    __required: true,
  },
  permBlock: {
    __type: 'boolean',
    __required: true,
  },
};

export const UserMongoDBSchema = new Schema({
  ...MongoDBEntitySchemaString,
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  roles: {
    type: [Object],
    required: true,
  },
  refreshTokens: {
    type: [UserRefreshTokenMongoDBSchema],
    required: true,
  },
  personal: {
    type: UserPersonalMongoDBSchema,
    required: true,
  },
  verified: Boolean,
  otp: {
    type: String,
    required: true,
  },
  blockedTo: {
    type: Number,
    required: true,
  },
  permBlock: {
    type: Boolean,
    required: true,
  },
});
