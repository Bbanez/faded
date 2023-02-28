import { search } from '@banez/search';
import { createFSDBRepository } from '@becomes/purple-cheetah-mod-fsdb';
import type { FSDBRepository } from '@becomes/purple-cheetah-mod-fsdb/types';
import type { MongoDBRepository } from '@becomes/purple-cheetah-mod-mongodb/types';
import type { Module } from '@becomes/purple-cheetah/types';
import { Config } from '@faded/config';
import { Repo } from '@faded/repo';
import { User, UserFSDBSchema } from './models';

export interface UserRepoMethods {
  findByUsername(Username: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByIdAndRefreshToken(id: string, rt: string): Promise<User | null>;
  findByIdOrUsername(idOrUsername: string): Promise<User | null>;
  search(
    term: string,
    limit: number,
    offset: number,
  ): Promise<{
    users: User[];
    count: number;
  }>;
}

export type UserRepo =
  | MongoDBRepository<User, UserRepoMethods>
  | FSDBRepository<User, UserRepoMethods>;

export function createUserRepo(): Module {
  return {
    name: 'User repository',
    initialize({ next }) {
      if (Config.fsdb) {
        Repo.user = createFSDBRepository<User, UserRepoMethods>({
          name: 'User repository',
          collection: `${Config.dbPrfx}_users`,
          schema: UserFSDBSchema,
          methods({ repo }) {
            return {
              findByEmail(email) {
                return repo.findBy((e) => e.email === email);
              },
              findByIdAndRefreshToken(id, rt) {
                return repo.findBy(
                  (e) =>
                    e._id === id &&
                    !!e.refreshTokens.find((t) => t.value === rt),
                );
              },
              findByUsername(username) {
                return repo.findBy((e) => e.username === username);
              },
              findByIdOrUsername(idOrUsername) {
                return repo.findBy(
                  (e) => e._id === idOrUsername || e.username === idOrUsername,
                );
              },
              async search(term, limit, offset) {
                const users = await repo.findAll();
                const result = search({
                  searchTerm: term,
                  set: users.map((user) => {
                    return {
                      id: user._id,
                      data: [
                        user.username,
                        `${user.personal.firstName} ${user.personal.lastName}`,
                      ],
                    };
                  }),
                });
                return {
                  count: result.items.length,
                  users: result.items
                    .map((item) => users.find((e) => e._id === item.id) as User)
                    .slice(offset, limit + offset),
                };
              },
            };
          },
        });
      }
      next();
    },
  };
}
