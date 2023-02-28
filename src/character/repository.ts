import { createFSDBRepository } from '@becomes/purple-cheetah-mod-fsdb';
import type { FSDBRepository } from '@becomes/purple-cheetah-mod-fsdb/types';
import type { MongoDBRepository } from '@becomes/purple-cheetah-mod-mongodb/types';
import type { Module } from '@becomes/purple-cheetah/types';
import { Config } from '@faded/config';
import { Repo } from '@faded/repo';
import {
  Character,
  CharacterFSDBSchema,
} from './models';

export interface CharacterRepoMethods {
  findByName(name: string): Promise<Character | null>;
  findAllByUserId(userId: string): Promise<Character[]>;
}

export type CharacterRepo =
  | FSDBRepository<Character, CharacterRepoMethods>
  | MongoDBRepository<Character, CharacterRepoMethods>;

export function createCharacterRepo(): Module {
  return {
    name: 'Character repository',
    initialize({ next }) {
      if (Config.fsdb) {
        Repo.char = createFSDBRepository<Character, CharacterRepoMethods>({
          name: 'Character repository',
          collection: `${Config.dbPrfx}_characters`,
          schema: CharacterFSDBSchema,
          methods({ repo }) {
            return {
              async findByName(name) {
                return repo.findBy((e) => e.name === name);
              },
              findAllByUserId(userId) {
                return repo.findAllBy((e) => e.userId === userId);
              },
            };
          },
        });
      }
      next();
    },
  };
}
