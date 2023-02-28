import type { CharacterRepo } from './character';
import type { UserRepo } from './user';

export class Repo {
  static char: CharacterRepo;
  static user: UserRepo;
}
