import { createMongoDBRepository } from 'servaljs-mongodb';
import { UserInvitation, UserInvitationSchema } from './models';

export interface UserInvitationRepoMethods {
  findAllByFrom(from: string): Promise<UserInvitation[]>;
  findAllByTo(to: string): Promise<UserInvitation[]>;
  findByFromAndTo(from: string, to: string): Promise<UserInvitation | null>;
  findByIdAndTo(_id: string, to: string): Promise<UserInvitation | null>;
}

export const UserInvitationRepo = createMongoDBRepository<
  UserInvitation,
  UserInvitationRepoMethods
>({
  name: 'User invitation repo',
  collection: 'user_invitations',
  schema: UserInvitationSchema,
  methods({ mdb }) {
    return {
      async findAllByFrom(from) {
        return await mdb.find({ from }).toArray();
      },

      async findAllByTo(to) {
        return await mdb.find({ to }).toArray();
      },

      async findByFromAndTo(from, to) {
        return await mdb.findOne({ from, to });
      },

      async findByIdAndTo(_id, to) {
        return await mdb.findOne({ _id, to });
      },
    };
  },
});
