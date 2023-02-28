import type { ObjectSchema } from '@becomes/purple-cheetah/types';
import { Schema } from 'mongoose';

export interface UserRefreshToken {
  value: string;
  expAt: number;
}

export const UserRefreshTokenFSDBSchema: ObjectSchema = {
  value: {
    __type: 'string',
    __required: true,
  },
  expAt: {
    __type: 'number',
    __required: true,
  },
};

export const UserRefreshTokenMongoDBSchema = new Schema({
  value: {
    type: String,
    required: true,
  },
  expAt: {
    type: Number,
    required: true,
  },
});
