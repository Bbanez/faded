import type { ObjectSchema } from '@banez/object-utility/types';

export interface UserRefreshToken {
  value: string;
  meta: string;
  expAt: number;
}

export const UserRefreshTokenSchema: ObjectSchema = {
  value: {
    __type: 'string',
    __required: true,
  },
  meta: {
    __type: 'string',
    __required: true,
  },
  expAt: {
    __type: 'number',
    __required: true,
  },
};
