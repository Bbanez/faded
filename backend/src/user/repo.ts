import type { Filter } from 'mongodb';
import { createMongoDBRepository } from 'servaljs-mongodb';
import { User, UserSchema, UserSignupType } from './models';

export interface UserRepoMethods {
  findAll(limit: number, offset: number): Promise<User[]>;
  findAllBySearch(search: string): Promise<User[]>;
  findByOauthId(type: UserSignupType, id: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
}

export const UserRepo = createMongoDBRepository<User, UserRepoMethods>({
  name: 'User repo',
  collection: 'users',
  schema: UserSchema,
  methods({ mdb }) {
    return {
      async findAll(limit, offset) {
        return await mdb.find().limit(limit).skip(offset).toArray();
      },

      async findAllBySearch(search) {
        return await mdb
          .find({
            username: { $regex: search },
          })
          .limit(10)
          .skip(0)
          .toArray();
      },

      async findByOauthId(type, id) {
        const filter: Filter<User> = {};
        filter[`oauthIds.${type}`] = id;
        return await mdb.findOne(filter);
      },

      async findByUsername(username) {
        return await mdb.findOne({ username });
      },
    };
  },
});
