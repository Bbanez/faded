import { createProxyMiddleware } from 'http-proxy-middleware';
import {
  createBodyParserMiddleware,
  createCorsMiddleware,
  createMiddleware,
  createPurpleCheetah,
  createRequestLoggerMiddleware,
} from '@becomes/purple-cheetah';
import { createFSDB } from '@becomes/purple-cheetah-mod-fsdb';
import { createJwt, useJwt } from '@becomes/purple-cheetah-mod-jwt';
import {
  JWT,
  JWTAlgorithm,
  JWTError,
  JWTPermissionName,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { createMongoDB } from '@becomes/purple-cheetah-mod-mongodb';
import { createSocket } from '@becomes/purple-cheetah-mod-socket';
import { AuthController } from './auth';
import { createCharacterRepo } from './character';
import { Config } from './config';
import { createResponseCodes } from './response-code';
import type { JWTProps } from './security';
import { createUserRepo, UserController } from './user';
import { createBcms } from './bcms';
import { MapController } from './map';

createPurpleCheetah({
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 1281,
  controllers: [AuthController, UserController, MapController],
  middleware: [
    createMiddleware({
      name: 'Proxy',
      after: true,
      async handler() {
        return createProxyMiddleware({
          target: 'http://localhost:1282',
          ws: true,
          changeOrigin: true,
          timeout: 30000,
        });
      },
    }),
    createCorsMiddleware(),
    createBodyParserMiddleware(),
    createRequestLoggerMiddleware(),
  ],
  modules: [
    createBcms(),
    Config.fsdb
      ? createFSDB({
          output: 'db/faded',
          prettyOutput: true,
          saveInterval: 2000,
        })
      : createMongoDB({}),

    createCharacterRepo(),
    createUserRepo(),

    createJwt({
      scopes: [
        {
          alg: JWTAlgorithm.HMACSHA256,
          expIn: Config.jwt.expIn,
          issuer: Config.jwt.issuer,
          secret: Config.jwt.secret,
        },
      ],
    }),

    createSocket({
      path: '/api/socket',
      onConnection(socket) {
        let id: string;
        try {
          const token: JWT<JWTProps> = JSON.parse(
            socket.handshake.query.token as string,
          );
          id = token.payload.userId;
        } catch (err) {
          id = 'none';
        }
        return {
          createdAt: Date.now(),
          id,
          scope: 'general',
          socket,
        };
      },
      async verifyConnection(socket) {
        const jwt = useJwt();
        const token = jwt.get<JWTProps>({
          jwtString: socket.handshake.query.token as string,
          roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
          permissionName: JWTPermissionName.READ,
        });
        if (token instanceof JWTError) {
          return false;
        }
        socket.handshake.query.token = JSON.stringify(token);
        return true;
      },
    }),

    createResponseCodes(),
  ],
});
