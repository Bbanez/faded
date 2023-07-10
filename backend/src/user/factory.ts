import { ObjectId } from 'mongodb';
import type { User, UserProtected, UserPublic } from './models';

export class UserFactory {
  static create(data: Omit<User, '_id' | 'createdAt' | 'updatedAt'>): User {
    return {
      _id: `${new ObjectId()}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ban: data.ban,
      oauthIds: data.oauthIds,
      suspend: data.suspend,
      username: data.username,
      image: data.image,
      role: data.role,
      email: data.email,
      setupDone: data.setupDone,
      friends: data.friends,
      blockedUsers: data.blockedUsers,
    };
  }

  static toProtected(data: User): UserProtected {
    return {
      _id: data._id,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      ban: data.ban,
      suspend: data.suspend,
      username: data.username,
      image: data.image,
      role: data.role,
      email: data.email,
      setupDone: data.setupDone,
      friends: data.friends,
      blockedUsers: data.blockedUsers,
    };
  }

  static toPublic(data: User): UserPublic {
    return {
      _id: data._id,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      ban: data.ban,
      suspend: data.suspend,
      username: data.username,
      image: data.image,
      role: data.role,
    };
  }
}
