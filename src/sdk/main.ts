import { createQueue } from '@banez/queue';
import { QueueError } from '@banez/queue/types';
import { createStorage } from '@banez/storage';
import type { AxiosError, AxiosRequestConfig } from 'axios';
import axios from 'axios';
import { SocketHandler } from './socket';
import { createStore } from './store';
import type { Jwt } from './types';
import { UserHandler } from './user';
import { Buffer } from 'buffer';

export interface SdkConfig {
  apiOrigin: string;
}

export interface SendFunction {
  <Data>(config: AxiosRequestConfig & { doNotAuth?: boolean }): Promise<Data>;
}

export class Sdk {
  private refreshQueue = createQueue<boolean>();

  public storage = createStorage({
    prfx: 'faded',
  });
  public store = createStore();
  public accessTokenRaw: string | null;
  public accessToken: Jwt | null;

  public user: UserHandler;
  public socket: SocketHandler;

  constructor(private config: SdkConfig) {
    this.accessTokenRaw = this.storage.get('at');
    this.accessToken = this.accessTokenRaw
      ? this.unpackAccessToken(this.accessTokenRaw)
      : null;
    this.user = new UserHandler(this);
    this.socket = new SocketHandler({
      origin: config.apiOrigin,
      cache: this.store,
      path: `/api/socket`,
      refreshAccess: this.refreshAccessToken,
      storage: this.storage,
      userHandler: this.user,
    });
  }

  public unpackAccessToken(at: string): Jwt | null {
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

  public clearAndLogout() {
    this.accessToken = null;
    this.accessTokenRaw = null;
    this.storage.clear().catch((err) => {
      // eslint-disable-next-line no-console
      console.error(err);
    });
  }

  public async isLoggedIn(): Promise<boolean> {
    const result = await this.refreshAccessToken();
    if (result && this.accessTokenRaw) {
      await this.socket.connect();
    }
    return result;
  }

  public send: SendFunction = async <T>(
    conf: AxiosRequestConfig & { doNotAuth?: boolean },
  ): Promise<T> => {
    if (conf.headers && conf.headers.Authorization === '' && !conf.doNotAuth) {
      const loggedIn = await this.isLoggedIn();
      conf.headers.Authorization = `Bearer ${this.accessTokenRaw}`;
      if (!loggedIn || !this.accessTokenRaw) {
        throw {
          status: 401,
          message: 'Not logged in.',
        };
      }
    }
    if (this.socket.id()) {
      if (!conf.headers) {
        conf.headers = {};
      }
      conf.headers['X-Faded-Sid'] = this.socket.id() as string;
    }
    conf.url = `${this.config.apiOrigin ? this.config.apiOrigin : ''}/api${
      conf.url
    }`;
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
  };

  public async refreshAccessToken(force?: boolean): Promise<boolean> {
    const queue = await this.refreshQueue({
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
            this.accessTokenRaw = this.storage.get<string>('at');
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
        const refreshToken = this.storage.get('rt');
        if (!refreshToken) {
          return false;
        }
        try {
          const result = await this.send<{ accessToken: string }>({
            url: '/auth/refresh-access',
            method: 'POST',
            data: {
              token: refreshToken,
            },
          });
          this.accessToken = this.unpackAccessToken(result.accessToken);
          await this.storage.set('at', result.accessToken);
          return true;
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(error);
          this.clearAndLogout();
          return false;
        }
      },
    }).wait;
    if (queue instanceof QueueError) {
      throw Error(queue.error as string);
    }
    return queue.data;
  }
}
