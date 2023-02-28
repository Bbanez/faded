import type { ObjectSchema } from '@banez/object-utility/types';
import {
  createController,
  createControllerMethod,
} from '@becomes/purple-cheetah';
import { HTTPStatus } from '@becomes/purple-cheetah/types';
import type {
  FadedCharacterClassEntryMeta,
  FadedCharacterRaceEntryMeta,
} from '@bcms/types';
import { BCMS } from '@faded/bcms-client';
import { Config } from '@faded/config';
import { Repo } from '@faded/repo';
import { responseCode } from '@faded/response-code';
import {
  RouteProtection,
  RouteProtectionJWTAndBodyCheckResult,
  RouteProtectionJWTResult,
} from '@faded/security';
import { CharacterFactory } from './factory';
import type { Character } from './models';

interface CreateBody {
  raceId: string;
  classId: string;
  name: string;
}
const CreateBodySchema: ObjectSchema = {
  raceId: {
    __type: 'string',
    __required: true,
  },
  classId: {
    __type: 'string',
    __required: true,
  },
  name: {
    __type: 'string',
    __required: true,
  },
};

export const CharacterController = createController({
  name: 'Character',
  path: '/api/character',
  methods() {
    return {
      getAll: createControllerMethod<
        RouteProtectionJWTResult,
        { items: Character[] }
      >({
        path: '/all',
        type: 'get',
        preRequestHandler: RouteProtection.jwt(),
        async handler({ jwt }) {
          return {
            items: await Repo.char.methods.findAllByUserId(jwt.payload.userId),
          };
        },
      }),

      checkName: createControllerMethod<
        RouteProtectionJWTAndBodyCheckResult<{ name: string }>,
        { ok: boolean }
      >({
        path: '/check-name',
        type: 'post',
        preRequestHandler: RouteProtection.jwtAndBodyCheck({
          bodySchema: {
            name: {
              __type: 'string',
              __required: true,
            },
          },
        }),
        async handler({ body }) {
          const char = await Repo.char.methods.findByName(body.name);
          return {
            ok: !!char,
          };
        },
      }),

      get: createControllerMethod<
        RouteProtectionJWTResult,
        { item: Character }
      >({
        path: '/:id',
        type: 'get',
        preRequestHandler: RouteProtection.jwt(),
        async handler({ request, errorHandler }) {
          const char = await Repo.char.findById(request.params.id);
          if (!char) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              responseCode('ch001', { id: request.params.id }),
            );
          }
          return {
            item: char,
          };
        },
      }),

      create: createControllerMethod<
        RouteProtectionJWTAndBodyCheckResult<CreateBody>,
        { item: Character }
      >({
        type: 'post',
        preRequestHandler: RouteProtection.jwtAndBodyCheck({
          bodySchema: CreateBodySchema,
        }),
        async handler({ jwt, body, errorHandler }) {
          const race = await BCMS.getEntryMeta<FadedCharacterRaceEntryMeta>({
            template: Config.cmsRaceTemplate,
            entry: body.raceId,
          });
          if (!race) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              responseCode('ch002', { id: body.raceId }),
            );
          }
          const cClass = await BCMS.getEntryMeta<FadedCharacterClassEntryMeta>({
            template: Config.cmsRaceTemplate,
            entry: body.classId,
          });
          if (!cClass) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              responseCode('ch003', { id: body.classId }),
            );
          }
          const characterWithSameName = await Repo.char.methods.findByName(
            body.name,
          );
          if (characterWithSameName) {
            throw errorHandler.occurred(
              HTTPStatus.FORBIDDEN,
              responseCode('ch004', { name: body.name }),
            );
          }
          const character = await Repo.char.add(
            CharacterFactory.instance({
              name: body.name,
              classId: cClass._id,
              level: 1,
              location: [0, 0],
              mapId: Config.cmsMapStart,
              raceId: race._id,
              userId: jwt.payload.userId,
            }),
          );
          return {
            item: character,
          };
        },
      }),
    };
  },
});
