import { UserRepo } from './user';
import { UserInvitationRepo } from './user-invitation';

export class Repo {
  static user = UserRepo;
  static userInvitation = UserInvitationRepo;
}
