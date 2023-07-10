import type { ObjectSchema } from '@banez/object-utility/types';
import { MongoDBEntry, MongoDBEntrySchema } from 'servaljs-mongodb';

export type UserInvitationStatus = 'pending' | 'cancel';

export interface UserInvitation extends MongoDBEntry {
  to: string;
  from: string;
  status: UserInvitationStatus;
}

export const UserInvitationSchema: ObjectSchema = {
  ...MongoDBEntrySchema,
  to: {
    __type: 'string',
    __required: true,
  },
  from: {
    __type: 'string',
    __required: true,
  },
  status: {
    __type: 'string',
    __required: true,
  },
};
