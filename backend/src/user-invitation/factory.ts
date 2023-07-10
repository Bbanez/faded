import { ObjectId } from 'mongodb';
import type { UserInvitation } from './models';

export class UserInvitationFactory {
  static create(
    data: Omit<UserInvitation, '_id' | 'createdAt' | 'updatedAt'>,
  ): UserInvitation {
    return {
      _id: `${new ObjectId()}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      from: data.from,
      status: data.status,
      to: data.to,
    };
  }
}
