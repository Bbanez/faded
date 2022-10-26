import type { Sdk } from './main';
import type { User } from './models';

export class UserHandler {
  private readonly base = '/user';

  constructor(private sdk: Sdk) {}

  async me(options?: { skipCache?: boolean }): Promise<User> {
    const skipCache = options && options.skipCache;
    if (!skipCache) {
      const cacheHit = this.sdk.store.user.methods.me();
      if (cacheHit) {
        return cacheHit;
      }
    }
    const result = await this.sdk.send<{
      item: User;
    }>({
      url: `${this.base}`,
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
      const cacheHit = this.sdk.store.user.find(
        (e) => e.id === ref || e.username === ref,
      );
      if (cacheHit) {
        return cacheHit;
      }
    }
    const result = await this.sdk.send<{
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
    return await this.sdk.send<{
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
    if (!(await this.sdk.isLoggedIn())) {
      const result = await this.sdk.send<{
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
      this.sdk.storage.set('rt', result.refreshToken);
      this.sdk.accessTokenRaw = result.accessToken;
      this.sdk.accessToken = this.sdk.unpackAccessToken(result.accessToken);
      this.sdk.storage.set('at', result.accessToken);
    }
  }

  async logout() {
    if (await this.sdk.isLoggedIn()) {
      const rt = this.sdk.storage.get<string>('rt');
      if (rt) {
        await this.sdk.send({
          url: '/auth/logout',
          method: 'POST',
          data: {
            token: rt,
          },
        });
        this.sdk.clearAndLogout();
      }
    }
  }

  async isUsernameAvailable(username: string): Promise<boolean> {
    const result = await this.sdk.send<{ available: boolean }>({
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
    await this.sdk.send({
      url: `${this.base}/sign-up`,
      method: 'POST',
      data,
    });
  }

  async signupComplete(data: { userId: string; otp: string }): Promise<void> {
    await this.sdk.send({
      url: `${this.base}/sign-up/complete`,
      method: 'POST',
      data,
    });
  }
}
