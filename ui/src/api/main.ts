import { Storage } from '@ui/storage';
import type { UserJwt } from '@backend/user';
import { createQueue } from '@banez/queue';
import { QueueError } from '@banez/queue/types';
import type { AxiosError, AxiosRequestConfig } from 'axios';
import axios from 'axios';
import { Buffer } from 'buffer';
import { AuthHandler } from './handlers/auth';
import { UserHandler } from './handlers/user';
import { Store, useStore } from '@ui/store';
import { UserInvitationHandler } from './handlers/user-invitation';
import { MapHandler } from './handlers/map';

export class Api {
  public apiOrigin = '';
  public accessTokenRaw: string | null = null;
  public accessToken: UserJwt | null = null;

  private refreshQueue = createQueue<boolean>();

  public auth = new AuthHandler(this);
  public user = new UserHandler(this);
  public userInvitation = new UserInvitationHandler(this);
  public map = new MapHandler(this);

  constructor(public store: Store) {
    this.accessTokenRaw = Storage.get('at');
    if (this.accessTokenRaw) {
      this.accessToken = this.unpackAccessToken(this.accessTokenRaw);
    }
    Storage.subscribe<string>('at', (value, type) => {
      if (type === 'set') {
        this.accessTokenRaw = value;
        if (this.accessTokenRaw) {
          this.accessToken = this.unpackAccessToken(this.accessTokenRaw);
        }
      } else {
        this.accessTokenRaw = null;
        this.accessToken = null;
      }
    });
  }

  private unpackAccessToken(at: string): UserJwt | null {
    const atParts = at.split('.');
    if (atParts.length === 3) {
      return {
        header: JSON.parse(Buffer.from(atParts[0], 'base64').toString()),
        payload: JSON.parse(Buffer.from(atParts[1], 'base64').toString()),
        signature: atParts[2],
      };
    }
    return null;
  }

  public async clearAndLogout() {
    this.accessToken = null;
    this.accessTokenRaw = null;
    await Storage.clear();
    for (const _key in Store) {
      const key = _key as keyof typeof Store;
      (this.store as any)[key].remove(
        (this.store as any)[key].items().map((e: any) => e._id),
      );
    }
  }

  public async refreshAccessToken(force?: boolean): Promise<boolean> {
    const result = await this.refreshQueue({
      name: 'refresh',
      handler: async () => {
        if (!force) {
          let refresh = true;
          if (this.accessToken) {
            if (
              this.accessToken.payload.iat + this.accessToken.payload.exp >
              Date.now() + 1000
            ) {
              refresh = false;
            }
          } else {
            this.accessTokenRaw = Storage.get<string>('at');
            if (this.accessTokenRaw) {
              this.accessToken = this.unpackAccessToken(this.accessTokenRaw);
              if (
                this.accessToken &&
                this.accessToken.payload.iat + this.accessToken.payload.exp >
                  Date.now()
              ) {
                refresh = false;
              }
            }
          }
          if (!refresh) {
            return true;
          }
        }
        const refreshToken = Storage.get('rt');
        if (!refreshToken) {
          return false;
        }
        try {
          const res = await this.send<{ token: string }>({
            url: '/v1/auth/refresh-access',
            doNotAuth: true,
            method: 'POST',
            data: {
              token: Storage.get('rt'),
            },
          });
          this.accessToken = this.unpackAccessToken(res.token);
          await Storage.set('at', res.token);
          return true;
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(error);
          await this.clearAndLogout();
          return false;
        }
      },
    }).wait;
    if (result instanceof QueueError) {
      throw result.error;
    }
    return result.data;
  }

  public async isLoggedIn(): Promise<boolean> {
    const result = await this.refreshAccessToken();
    return result;
  }

  public async send<Result = unknown>(
    conf: AxiosRequestConfig & { doNotAuth?: boolean },
  ): Promise<Result> {
    if (!conf.headers) {
      conf.headers = {};
    }
    if (!conf.doNotAuth) {
      const loggedIn = await this.isLoggedIn();
      conf.headers.Authorization = `Bearer ${this.accessTokenRaw}`;
      if (!loggedIn || !this.accessTokenRaw) {
        throw {
          status: 401,
          message: 'Not logged in.',
        };
      }
    }
    conf.url = `${this.apiOrigin}/api${conf.url}`;
    try {
      conf.maxBodyLength = 100000000;
      const response = await axios(conf);
      return response.data;
    } catch (error) {
      const err = error as AxiosError<{
        message: string;
        code: string;
      }>;
      if (err.response) {
        if (err.response.data && err.response.data.message) {
          throw {
            status: err.response.status,
            code: err.response.data.code,
            message: err.response.data.message,
          };
        } else {
          throw {
            status: err.response.status,
            code: '-1',
            message: err.message,
          };
        }
      } else {
        throw {
          status: -1,
          code: '-1',
          message: err.message,
        };
      }
    }
  }
}

let api: Api;

export function useApi() {
  if (!api) {
    api = new Api(useStore());
  }
  return api;
}
