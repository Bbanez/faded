import { Storage } from '@client/storage';
import { Store } from '@client/store';
import type { User } from '@faded/user/models';
import { SDK } from './main';

export class UserHandler {
  private readonly base = '/user';

  async me(options?: { skipCache?: boolean }): Promise<User> {
    const skipCache = options && options.skipCache;
    if (!skipCache) {
      const cacheHit = Store.user.methods.me();
      if (cacheHit) {
        return cacheHit;
      }
    }
    const result = await SDK.send<{
      item: User;
    }>({
      url: `${this.base}/me`,
      method: 'GET',
      headers: {
        Authorization: '',
      },
    });
    return result.item;
  }

  async get(
    ref: string,
    options?: {
      skipCache?: boolean;
    },
  ): Promise<User> {
    const skipCache = options && options.skipCache;
    if (!skipCache) {
      const cacheHit = Store.user.find(
        (e) => e._id === ref || e.username === ref,
      );
      if (cacheHit) {
        return cacheHit;
      }
    }
    const result = await SDK.send<{
      item: User;
    }>({
      url: `${this.base}/${ref}`,
      method: 'GET',
      headers: {
        Authorization: '',
      },
    });
    return result.item;
  }

  async getAll(options?: {
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    items: User[];
    limit: number;
    offset: number;
    pages: number;
  }> {
    const query: string[] = [];
    if (options) {
      if (options.search) {
        query.push(`search=${options.search}`);
      }
      if (typeof options.limit === 'number') {
        query.push(`limit=${options.limit}`);
      }
      if (typeof options.offset === 'number') {
        query.push(`offset=${options.offset}`);
      }
    }
    return await SDK.send<{
      items: User[];
      limit: number;
      offset: number;
      pages: number;
    }>({
      url: `${this.base}/all${query.length > 0 ? `?${query.join('&')}` : ''}`,
      method: 'GET',
      headers: {
        Authorization: '',
      },
    });
  }

  async login(options: { email: string; password: string }): Promise<void> {
    if (!(await SDK.isLoggedIn())) {
      const result = await SDK.send<{
        refreshToken: string;
        accessToken: string;
      }>({
        url: '/auth/login',
        method: 'POST',
        data: {
          email: options.email,
          password: options.password,
        },
      });
      Storage.set('rt', result.refreshToken);
      Storage.set('at', result.accessToken);
      SDK.accessTokenRaw = result.accessToken;
      SDK.accessToken = SDK.unpackAccessToken(result.accessToken);
    }
  }

  async logout() {
    if (await SDK.isLoggedIn()) {
      const rt = Storage.get<string>('rt');
      if (rt) {
        await SDK.send({
          url: '/auth/logout',
          method: 'POST',
          data: {
            token: rt,
          },
        });
        SDK.clearAndLogout();
      }
    }
  }

  async isUsernameAvailable(username: string): Promise<boolean> {
    const result = await SDK.send<{ available: boolean }>({
      url: `${this.base}/check-username`,
      method: 'POST',
      data: {
        username,
      },
    });
    return result.available;
  }

  async signup(data: {
    email: string;
    password: string;
    username: string;
    firstName: string;
    lastName: string;
  }): Promise<void> {
    await SDK.send({
      url: `${this.base}/sign-up`,
      method: 'POST',
      data,
    });
  }

  async signupComplete(data: { userId: string; otp: string }): Promise<void> {
    await SDK.send({
      url: `${this.base}/sign-up/complete`,
      method: 'POST',
      data,
    });
  }
}
