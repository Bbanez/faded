import { Config } from '@backend/config';
import { Repo } from '@backend/repo';
import axios from 'axios';
import * as crypto from 'crypto';
import { createController, createControllerMethod, HttpStatus } from 'servaljs';
import { useRedis } from 'servaljs-redis';
import { UserFactory, UserJwtProps, UserRefreshToken } from '@backend/user';
import { responseCode } from '@backend/response-code';
import {
  RouteProtection,
  RouteProtectionBodyCheckResult,
} from '@backend/security';
import type { ObjectSchema } from '@banez/object-utility/types';
import { JWTEncode, JWTError, JWTManager } from 'servaljs-jwt';

export interface AuthLoginBody {
  userId: string;
  otp: string;
}
export const AuthLoginBodySchema: ObjectSchema = {
  userId: {
    __type: 'string',
    __required: true,
  },
  otp: {
    __type: 'string',
    __required: true,
  },
};

export interface AuthLoginResult {
  accessToken: string;
  refreshToken: string;
}

export interface AuthLogoutBody {
  token: string;
}
export const AuthLogoutBodySchema: ObjectSchema = {
  token: {
    __type: 'string',
    __required: true,
  },
};

export const AuthController = createController({
  name: 'Auth',
  path: '/api/v1/auth',
  methods() {
    const redis = useRedis();
    return {
      redirect: createControllerMethod<void, { ok: boolean }>({
        path: '/redirect/:service',
        type: 'get',
        async handler({ request, replay }) {
          const params = request.params as any;
          const query = request.query as any;
          const service = params.service;
          const stateData: {
            [key: string]: string;
          } = {
            nonce: crypto.randomBytes(8).toString('hex'),
            _a: query._a as string,
          };
          switch (service) {
            case 'google':
              {
                await redis.client.set(
                  `gogl.nonce.${request.headers.rip}`,
                  Buffer.from(JSON.stringify(stateData)).toString('hex'),
                  {
                    EX: 60,
                  },
                );
                replay.header(
                  'Location',
                  `https://accounts.google.com/o/oauth2/auth?client_id=${
                    Config.oauthGoogleClientId
                  }&redirect_uri=${encodeURIComponent(
                    `${Config.origin}/api/v1/auth/callback/google`,
                  )}&response_type=code&access_type=offline&scope=email https://www.googleapis.com/auth/userinfo.profile&state=${
                    stateData.nonce
                  }`,
                );
                replay.status(302);
              }
              break;
            case 'github':
              {
                await redis.client.set(
                  `gh.nonce.${request.headers.rip}`,
                  Buffer.from(JSON.stringify(stateData)).toString('hex'),
                  {
                    EX: 60,
                  },
                );
                replay.header(
                  'Location',
                  `https://github.com/login/oauth/authorize?client_id=${
                    Config.oauthGithubClientId
                  }&redirect_uri=${encodeURIComponent(
                    `${Config.origin}/api/v1/auth/callback/github`,
                  )}&scope=read:user,user:email&state=${
                    stateData.nonce
                  }&allow_signup=false`,
                );
                replay.status(302);
              }
              break;
            default: {
              replay.header('Location', `${Config.origin}`);
              replay.status(302);
            }
          }
          return { ok: true };
        },
      }),

      callback: createControllerMethod<void, { ok: boolean }>({
        path: '/callback/:service',
        type: 'get',
        async handler({ replay, request, logger, errorHandler }) {
          const params = request.params as any;
          const query = request.query as any;
          const service = params.service;
          switch (service) {
            case 'google': {
              const state = await redis.client.getDel(
                `gogl.nonce.${request.headers.rip}`,
              );
              if (!state) {
                replay.status(302);
                replay.header(
                  'Location',
                  `${Config.origin}/?error=Invalid nonce from Google (1).`,
                );
                return { ok: true };
              }
              const stateData = JSON.parse(
                Buffer.from(state, 'hex').toString(),
              );
              if (query.state !== stateData.nonce) {
                replay.status(302);
                replay.header(
                  'Location',
                  '/?error=Invalid nonce from Google (2).',
                );
                return { ok: true };
              }
              const code = query.code as string;
              let accessToken = '';
              try {
                const res = await axios({
                  url: `https://oauth2.googleapis.com/token?code=${code}&client_id=${
                    Config.oauthGoogleClientId
                  }&client_secret=${
                    Config.oauthGoogleClientSecret
                  }&redirect_uri=${encodeURIComponent(
                    `${Config.origin}/api/v1/auth/callback/google`,
                  )}&grant_type=authorization_code`,
                  method: 'POST',
                });
                accessToken = res.data.access_token;
              } catch (error) {
                console.log(error);
                logger.error('googleCallback', error);
                throw errorHandler(
                  HttpStatus.Unauthorized,
                  'Failed to validate Google.',
                );
              }
              try {
                const userRes = await axios({
                  url: 'https://www.googleapis.com/oauth2/v1/userinfo?alt=json',
                  method: 'GET',
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                  },
                });
                const userInfo = userRes.data;
                if (!userInfo.verified_email) {
                  replay.status(302);
                  replay.header(
                    'Location',
                    `/?error=Email ${userInfo.email} is not verified on the Google. Please finish creating your account before using is to sign in.`,
                  );
                  return { ok: true };
                }
                let user = await Repo.user.methods.findByOauthId(
                  'google',
                  userInfo.id + '',
                );
                if (!user) {
                  user = UserFactory.create({
                    ban: {
                      status: false,
                    },
                    oauthIds: {
                      google: userInfo.id + '',
                    },
                    suspend: {
                      status: false,
                    },
                    username: crypto
                      .createHash('sha1')
                      .update(
                        Date.now() + crypto.randomBytes(8).toString('hex'),
                      )
                      .digest('hex'),
                    role: 'USER',
                    email: userInfo.email,
                    setupDone: false,
                    friends: [],
                    blockedUsers: [],
                  });
                  user = await Repo.user.add(user);
                  if (!user) {
                    throw errorHandler(
                      HttpStatus.InternalServerError,
                      responseCode('user001'),
                    );
                  }
                }
                const otp = crypto.randomBytes(64).toString('base64');
                await redis.client.set(`otp.${user._id}`, otp, {
                  EX: 60,
                });
                replay.header(
                  'Location',
                  `/?type=lo&d=${Buffer.from(
                    JSON.stringify({
                      otp,
                      userId: user._id,
                    }),
                  ).toString('hex')}${
                    stateData._a ? `&_a=${stateData._a}` : ''
                  }`,
                );
                replay.status(302);
                return { ok: true };
              } catch (error) {
                logger.error('googleCallback', error);
                throw errorHandler(
                  HttpStatus.InternalServerError,
                  'Failed to get user information.',
                );
              }
            }
            case 'github': {
              {
                const state = await redis.client.getDel(
                  `gh.nonce.${request.headers.rip}`,
                );
                if (!state) {
                  replay.status(302);
                  replay.header(
                    'Location',
                    '/?error=Invalid nonce from Github.',
                  );
                  return { ok: true };
                }
                const stateData = JSON.parse(
                  Buffer.from(state, 'hex').toString(),
                );
                if (query.state !== stateData.nonce) {
                  replay.status(302);
                  replay.header(
                    'Location',
                    '/?error=Invalid nonce from Github.',
                  );
                  return { ok: true };
                }
                const code = query.code as string;
                let accessToken = '';
                try {
                  const res = await axios({
                    url: `https://github.com/login/oauth/access_token?code=${code}&client_id=${Config.oauthGithubClientId}&client_secret=${Config.oauthGithubClientSecret}`,
                    method: 'POST',
                  });
                  accessToken = res.data.split('&')[0].split('=')[1];
                } catch (error) {
                  throw errorHandler(
                    HttpStatus.Unauthorized,
                    'Failed to validate GitHub.',
                  );
                }
                try {
                  const emailRes = await axios({
                    url: 'https://api.github.com/user/emails',
                    method: 'GET',
                    headers: {
                      Authorization: `Bearer ${accessToken}`,
                    },
                  });
                  const email = emailRes.data.find(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (e: any) => e.primary && e.verified,
                  );
                  if (!email) {
                    throw errorHandler(
                      HttpStatus.Forbidden,
                      'You do not have valid email on GitHub.',
                    );
                  }
                  const res = await axios({
                    url: 'https://api.github.com/user',
                    method: 'GET',
                    headers: {
                      Authorization: `Bearer ${accessToken}`,
                    },
                  });
                  let user = await Repo.user.methods.findByOauthId(
                    'github',
                    res.data.id + '',
                  );
                  if (!user) {
                    user = UserFactory.create({
                      ban: {
                        status: false,
                      },
                      oauthIds: {
                        github: res.data.id + '',
                      },
                      suspend: {
                        status: false,
                      },
                      username: crypto
                        .createHash('sha1')
                        .update(
                          Date.now() + crypto.randomBytes(8).toString('hex'),
                        )
                        .digest('hex'),
                      role: 'USER',
                      email: email.email,
                      setupDone: false,
                      friends: [],
                      blockedUsers: [],
                    });
                    user = await Repo.user.add(user);
                    if (!user) {
                      throw errorHandler(
                        HttpStatus.InternalServerError,
                        responseCode('user001'),
                      );
                    }
                  }
                  const otp = crypto.randomBytes(64).toString('base64');
                  await redis.client.set(`otp.${user._id}`, otp, {
                    EX: 60,
                  });
                  replay.header(
                    'Location',
                    `/?type=lo&d=${Buffer.from(
                      JSON.stringify({
                        otp,
                        userId: user._id,
                      }),
                    ).toString('hex')}${
                      stateData._a ? `&_a=${stateData._a}` : ''
                    }`,
                  );
                  replay.status(302);
                  return { ok: true };
                } catch (error) {
                  console.error(error);
                  throw errorHandler(
                    HttpStatus.InternalServerError,
                    'Failed to get user information.',
                  );
                }
              }
            }
          }
          replay.header('Location', Config.origin);
          replay.status(302);
          return { ok: true };
        },
      }),

      login: createControllerMethod<
        RouteProtectionBodyCheckResult<AuthLoginBody>,
        { accessToken: string; refreshToken: string }
      >({
        path: '/login',
        type: 'post',
        preRequestHandler: RouteProtection.createBodyCheck<{
          userId: string;
          otp: string;
        }>(AuthLoginBodySchema),
        async handler({ request, body, errorHandler }) {
          const otp = await redis.client.getDel(`otp.${body.userId}`);
          if (!otp || body.otp !== otp) {
            throw errorHandler(HttpStatus.Unauthorized, 'Invalid OTP.');
          }
          const user = await Repo.user.findById(body.userId);
          if (!user) {
            throw errorHandler(
              HttpStatus.InternalServerError,
              `Failed to find user "${body.userId}"`,
            );
          }
          const rt: UserRefreshToken = {
            expAt: Date.now() + 2592000000,
            meta: crypto
              .createHash('sha1')
              .update(request.headers.rip + '')
              .digest('hex'),
            value: crypto
              .createHash('sha512')
              .update(Date.now() + crypto.randomBytes(16).toString())
              .digest('base64'),
          };
          await redis.client.set(
            `rt.${user._id}_${rt.value}`,
            JSON.stringify(rt),
            {
              EX: 20 * 24 * 60 * 60,
            },
          );
          const accessToken = JWTManager.create<UserJwtProps>({
            issuer: Config.jwtIssuer,
            roles: [user.role],
            userId: user._id,
            props: {
              ban: user.ban,
              email: user.email,
              suspend: user.suspend,
              setupDone: user.setupDone,
            },
          });
          if (accessToken instanceof JWTError) {
            throw errorHandler(
              HttpStatus.InternalServerError,
              'Failed to create access token.',
            );
          }
          return {
            accessToken: JWTEncode.encode(accessToken),
            refreshToken: `${user._id}.${rt.value}`,
          };
        },
      }),

      refreshAccess: createControllerMethod<
        RouteProtectionBodyCheckResult<AuthLogoutBody>,
        { token: string }
      >({
        path: '/refresh-access',
        type: 'post',
        preRequestHandler:
          RouteProtection.createBodyCheck(AuthLogoutBodySchema),
        async handler({ body, errorHandler, request }) {
          const tokenMeta = crypto
            .createHash('sha1')
            .update(request.headers.rip + '')
            .digest('hex');
          const rtParts = body.token.split('.');
          if (rtParts.length !== 2) {
            throw errorHandler(HttpStatus.Forbidden, 'Invalid token length.');
          }
          const rtRaw = await redis.client.get(
            `rt.${rtParts[0]}_${rtParts[1]}`,
          );
          if (!rtRaw) {
            throw errorHandler(
              HttpStatus.Unauthorized,
              'Invalid token provided.',
            );
          }
          const rt: UserRefreshToken = JSON.parse(rtRaw);
          if (rt.meta !== tokenMeta) {
            throw errorHandler(
              HttpStatus.Unauthorized,
              'Invalid token provided.',
            );
          }
          const user = await Repo.user.findById(rtParts[0]);
          if (!user) {
            throw errorHandler(
              HttpStatus.InternalServerError,
              `Failed to find user "${rtParts[0]}"`,
            );
          }
          const userId = user._id;
          const accessToken = JWTManager.create<UserJwtProps>({
            issuer: Config.jwtIssuer,
            roles: [user.role],
            userId,
            props: {
              email: user.email,
              ban: user.ban,
              suspend: user.suspend,
              setupDone: user.setupDone,
            },
          });
          if (accessToken instanceof JWTError) {
            throw errorHandler(
              HttpStatus.InternalServerError,
              'Failed to create access token.',
            );
          }
          return { token: JWTEncode.encode(accessToken) };
        },
      }),

      logout: createControllerMethod<
        RouteProtectionBodyCheckResult<AuthLogoutBody>,
        { ok: boolean }
      >({
        path: '/logout',
        type: 'post',
        preRequestHandler:
          RouteProtection.createBodyCheck(AuthLogoutBodySchema),
        async handler({ body, errorHandler }) {
          const rtParts = body.token.split('.');
          if (rtParts.length !== 2) {
            throw errorHandler(HttpStatus.Forbidden, 'Invalid token length');
          }
          await redis.client.getDel(`rt.${rtParts[0]}_${rtParts[1]}`);
          return { ok: true };
        },
      }),
    };
  },
});
