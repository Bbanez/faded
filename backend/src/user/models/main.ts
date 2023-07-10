import type { ObjectSchema } from '@banez/object-utility/types';
import type { JWT } from 'servaljs-jwt';
import { MongoDBEntry, MongoDBEntrySchema } from 'servaljs-mongodb';

export type UserSignupType = 'github' | 'google' | 'microsoft';

export interface UserBan {
  status: boolean;
  message?: string;
  expAt?: number;
}
export const UserBanSchema: ObjectSchema = {
  status: {
    __type: 'boolean',
    __required: true,
  },
  message: {
    __type: 'string',
    __required: true,
  },
  expAt: {
    __type: 'number',
    __required: true,
  },
};

export interface UserSuspend {
  status: boolean;
  message?: string;
}
export const UserSuspendSchema: ObjectSchema = {
  status: {
    __type: 'boolean',
    __required: true,
  },
  message: {
    __type: 'string',
    __required: true,
  },
};

export type UserRole = 'ADMIN' | 'USER';

export interface User extends MongoDBEntry {
  username: string;
  image?: string;
  oauthIds: {
    github?: string;
    google?: string;
    microsoft?: string;
  };
  email: string;
  role: UserRole;
  ban: UserBan;
  suspend: UserSuspend;
  setupDone: boolean;
  friends: string[];
  blockedUsers: string[];
}

export type UserProtected = Omit<User, 'oauthIds'>;

export type UserPublic = Omit<
  UserProtected,
  'email' | 'setupDone' | 'friends' | 'blockedUsers'
>;

export const UserSchema: ObjectSchema = {
  ...MongoDBEntrySchema,
  username: {
    __type: 'string',
    __required: true,
  },
  image: {
    __type: 'string',
    __required: false,
  },
  role: {
    __type: 'string',
    __required: true,
  },
  email: {
    __type: 'string',
    __required: true,
  },
  oauthIds: {
    __type: 'object',
    __required: true,
    __child: {
      github: {
        __type: 'string',
        __required: false,
      },
      google: {
        __type: 'string',
        __required: false,
      },
      microsoft: {
        __type: 'string',
        __required: false,
      },
    },
  },
  ban: {
    __type: 'object',
    __required: true,
    __child: UserBanSchema,
  },
  suspend: {
    __type: 'object',
    __required: true,
    __child: UserSuspendSchema,
  },
  setupDone: {
    __type: 'boolean',
    __required: true,
  },
  friends: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'string',
    },
  },
  blockedUsers: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'string',
    },
  },
};

export interface UserJwtProps {
  email: string;
  ban: UserBan;
  suspend: UserSuspend;
  setupDone: boolean;
}

export type UserJwt = JWT<UserJwtProps>;
