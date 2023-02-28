import type { ObjectSchema } from '@banez/object-utility/types';
import {
  FSDBEntity,
  FSDBEntitySchema,
} from '@becomes/purple-cheetah-mod-fsdb/types';

export interface Character extends FSDBEntity {
  name: string;
  mapId: string;
  specId?: string;
  classId: string;
  raceId: string;
  userId: string;
  location: [number, number];
  level: number;
}

export const CharacterFSDBSchema: ObjectSchema = {
  ...FSDBEntitySchema,
  name: {
    __type: 'string',
    __required: true,
  },
  mapId: {
    __type: 'string',
    __required: true,
  },
  specId: {
    __type: 'string',
    __required: false,
  },
  classId: {
    __type: 'string',
    __required: true,
  },
  raceId: {
    __type: 'string',
    __required: true,
  },
  userId: {
    __type: 'string',
    __required: true,
  },
  location: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'number',
    },
  },
  level: {
    __type: 'number',
    __required: true,
  },
};
