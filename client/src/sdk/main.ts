import { createQueue } from '@banez/queue';
import { QueueError } from '@banez/queue/types';
import { Storage } from '@client/storage';
import type { AxiosError, AxiosRequestConfig } from 'axios';
import axios from 'axios';
import { MapHandler } from './map';
import { SocketHandler } from './socket';
import type { Jwt } from './types';
import { UserHandler } from './user';

export class SDK {
  private static refreshQueue = createQueue<boolean>();
  private static readonly config = {};
  public static accessTokenRaw: string | null;
  public static accessToken: Jwt | null;
  public static socket = new SocketHandler();
  public static user = new UserHandler();
  public static map = new MapHandler();

  public static unpackAccessToken(at: string): Jwt | null {
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

  public static clearAndLogout() {
    SDK.accessToken = null;
    SDK.accessTokenRaw = null;
    Storage.clear().catch((err) => {
      // eslint-disable-next-line no-console
      console.error(err);
    });
  }

  public static async isLoggedIn(): Promise<boolean> {
    const result = await SDK.refreshAccessToken();
    if (result && SDK.accessTokenRaw) {
      await SDK.socket.connect();
    }
    return result;
  }

  public static async send<Data = any>(
    conf: AxiosRequestConfig & { doNotAuth?: boolean },
  ): Promise<Data> {
    if (conf.headers && conf.headers.Authorization === '' && !conf.doNotAuth) {
      const loggedIn = await SDK.isLoggedIn();
      conf.headers.Authorization = `Bearer ${SDK.accessTokenRaw}`;
      if (!loggedIn || !SDK.accessTokenRaw) {
        throw {
          status: 401,
          message: 'Not logged in.',
        };
      }
    }
    if (SDK.socket.id()) {
      if (!conf.headers) {
        conf.headers = {};
      }
      conf.headers['X-Faded-Sid'] = SDK.socket.id() as string;
    }
    conf.url = `/api${conf.url}`;
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

  public static async refreshAccessToken(force?: boolean): Promise<boolean> {
    const queue = await SDK.refreshQueue({
      name: 'refresh',
      handler: async () => {
        if (!force) {
          let refresh = true;
          if (SDK.accessToken) {
            if (
              SDK.accessToken.payload.iat + SDK.accessToken.payload.exp >
              Date.now() + 1000
            ) {
              refresh = false;
            }
          } else {
            SDK.accessTokenRaw = Storage.get<string>('at');
            if (SDK.accessTokenRaw) {
              SDK.accessToken = SDK.unpackAccessToken(SDK.accessTokenRaw);
              if (
                SDK.accessToken &&
                SDK.accessToken.payload.iat + SDK.accessToken.payload.exp >
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
          const result = await SDK.send<{ accessToken: string }>({
            url: '/auth/refresh-access',
            method: 'POST',
            data: {
              token: refreshToken,
            },
          });
          SDK.accessToken = SDK.unpackAccessToken(result.accessToken);
          await Storage.set('at', result.accessToken);
          return true;
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(error);
          SDK.clearAndLogout();
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
