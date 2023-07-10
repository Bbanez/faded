import '@fastify/middie';
import * as path from 'path';
import { createServal } from 'servaljs';
import { createJwt } from 'servaljs-jwt';
import { createMongoDB } from 'servaljs-mongodb';
import { createRedis } from 'servaljs-redis';
import { AuthController } from './auth';
import { Config } from './config';
import { IPMiddleware } from './ip-middleware';
import { Repo } from './repo';
import { UserController } from './user/controller';
import * as FastifyMultipart from '@fastify/multipart';
import * as FastifyStatic from '@fastify/static';
import { UserInvitationController } from './user-invitation';

async function main() {
  createServal({
    server: {
      port: 7000,
      host: '0.0.0.0',
    },
    logs: {
      saveToFile: {
        interval: 5000,
        output: 'logs',
      },
    },
    middleware: [IPMiddleware],
    controllers: [AuthController, UserController, UserInvitationController],
    modules: [
      {
        name: 'Fastify modules',
        initialize({ next, fastify }) {
          async function init() {
            await fastify.register(FastifyMultipart);
            await fastify.register(FastifyStatic, {
              root: path.join(process.cwd(), 'uploads'),
            });
          }
          init()
            .then(() => next())
            .catch((err) => next(err));
        },
      },
      createJwt({
        scopes: [
          {
            alg: 'HS256',
            expIn: Config.jwtExpIn,
            issuer: Config.jwtIssuer,
            secret: Config.jwtSecret,
          },
        ],
      }),
      createRedis({
        url: Config.redisUrl,
      }),

      // Init repos
      createMongoDB({
        forceClose: true,
        url: Config.dbUrl,
      }),
      Repo.user.init(),
      Repo.userInvitation.init(),
    ],
  });
}
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
