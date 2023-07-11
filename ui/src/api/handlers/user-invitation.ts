import {
  ControllerItemResponse,
  ControllerItemsResponse,
} from '@backend/types';
import { UserInvitation } from '@backend/user-invitation';
import { UserInvitationCreateBody } from '@backend/user-invitation/controller';
import { Api } from '../main';

export class UserInvitationHandler {
  private readonly baseUrl = '/v1/user-invitation';
  private getAllLatch = false;

  constructor(private api: Api) {}

  async getAll(): Promise<UserInvitation[]> {
    if (this.getAllLatch) {
      return this.api.store.userInvitation.items();
    }
    const res = await this.api.send<ControllerItemsResponse<UserInvitation>>({
      url: `${this.baseUrl}/all`,
    });
    this.api.store.userInvitation.set(res.items);
    return res.items;
  }

  async create(data: UserInvitationCreateBody): Promise<UserInvitation> {
    const res = await this.api.send<ControllerItemResponse<UserInvitation>>({
      url: `${this.baseUrl}/`,
      method: 'POST',
      data,
    });
    this.api.store.userInvitation.set(res.item);
    return res.item;
  }

  async accept(data: { invitationId: string }): Promise<void> {
    await this.api.send({
      url: `${this.baseUrl}/accept/${data.invitationId}`,
      method: 'POST',
    });
    const inv = this.api.store.userInvitation.findById(data.invitationId);
    if (inv) {
      await this.api.user.get(inv.from);
    }
    this.api.store.userInvitation.remove(data.invitationId);
  }
}
