import {
  ControllerItemResponse,
  ControllerItemsResponse,
} from '@backend/types';
import { UserProtected, UserPublic } from '@backend/user';
import { UserUpdateBody } from '@backend/user/controller';
import { Api } from '../main';

export class UserHandler {
  private readonly baseUrl = '/v1/user';

  constructor(private api: Api) {}

  async getAll(data: {
    limit: number;
    offset: number;
  }): Promise<ControllerItemsResponse<UserPublic>> {
    return await this.api.send({
      url: `${this.baseUrl}/all?limit=${data.limit}&offset=${data.offset}`,
    });
  }

  async getMany(ids: string[]): Promise<UserPublic[]> {
    const cacheHit = this.api.store.user.findManyById(ids);
    if (cacheHit.length === ids.length) {
      return cacheHit;
    }
    const res = await this.api.send<ControllerItemsResponse<UserPublic>>({
      url: `${this.baseUrl}/many/${ids.join('-')}`,
    });
    this.api.store.user.set(res.items);
    return res.items;
  }

  async getFriends(): Promise<UserPublic[]> {
    const user = (await this.api.user.get()) as UserProtected;
    console.log({ user });
    const cacheHit = this.api.store.user.findManyById(user.friends || []);
    if (cacheHit.length === user.friends.length) {
      return cacheHit;
    }
    const res = await this.api.send<ControllerItemsResponse<UserPublic>>({
      url: `${this.baseUrl}/friends`,
    });
    this.api.store.user.set(res.items);
    return res.items;
  }

  async search(data: { term: string }): Promise<UserPublic[]> {
    const res = await this.api.send<ControllerItemsResponse<UserPublic>>({
      url: `${this.baseUrl}/search`,
      method: 'POST',
      data,
    });
    return res.items;
  }

  async checkUsername(data: { username: string }): Promise<boolean> {
    const res = await this.api.send<{ ok: boolean }>({
      url: `${this.baseUrl}/check-username/${data.username}`,
    });
    return res.ok;
  }

  async get(id?: string): Promise<UserProtected | UserPublic> {
    if (id) {
      const cacheHit = this.api.store.user.findById(id);
      if (cacheHit) {
        return cacheHit;
      }
    } else {
      const cacheHit = this.api.store.user.methods.me();
      if (cacheHit) {
        return cacheHit;
      }
    }
    const res = await this.api.send<
      ControllerItemResponse<UserPublic | UserProtected>
    >({
      url: `${this.baseUrl}/${id || 'me'}`,
    });
    this.api.store.user.set(res.item);
    return res.item;
  }

  async getByUsername(username: string): Promise<UserProtected | UserPublic> {
    const cacheHit = this.api.store.user.find((e) => e.username === username);
    if (cacheHit) {
      return cacheHit;
    }
    const res = await this.api.send<
      ControllerItemResponse<UserPublic | UserProtected>
    >({
      url: `${this.baseUrl}/username/${username}`,
    });
    this.api.store.user.set(res.item);
    return res.item;
  }

  async update(data: UserUpdateBody): Promise<UserProtected> {
    const res = await this.api.send<ControllerItemResponse<UserProtected>>({
      url: `${this.baseUrl}/`,
      method: 'PUT',
      data,
    });
    this.api.store.user.set(res.item);
    return res.item;
  }

  async uploadAvatar(data: { file: File }): Promise<UserProtected> {
    const fd = new FormData();
    fd.append('file', data.file, data.file.name);
    const res = await this.api.send<ControllerItemResponse<UserProtected>>({
      url: `${this.baseUrl}/upload-avatar`,
      method: 'POST',
      data: fd,
    });
    this.api.store.user.set(res.item);
    return res.item;
  }
}
