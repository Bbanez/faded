import type { ObjectSchema } from '@banez/object-utility/types';
import {
  FSDBEntity,
  FSDBEntitySchema,
} from '@becomes/purple-cheetah-mod-fsdb/types';
import { Tuple, TupleSchema } from '@faded/util';

export interface Character extends FSDBEntity {
  name: string;
  // Selections
  mapId: string;
  classId: string;
  raceId: string;
  userId: string;
  // Specialization
  specId?: string;
  // Armor
  bootsId?: string;
  chestId?: string;
  glovesId?: string;
  helmetId?: string;
  // Weapons
  mainWeaponId?: string
  offWeaponId?: string;
  // Other
  location: Tuple;
  level: number;
  exp: number;
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
  specId: {
    __type: 'string',
    __required: false,
  },
  bootsId: {
    __type: 'string',
    __required: false,
  },
  chestId: {
    __type: 'string',
    __required: false,
  },
  glovesId: {
    __type: 'string',
    __required: false,
  },
  helmetId: {
    __type: 'string',
    __required: false,
  },
  mainWeaponId: {
    __type: 'string',
    __required: false,
  },
  offWeaponId: {
    __type: 'string',
    __required: false,
  },
  location: TupleSchema,
  level: {
    __type: 'number',
    __required: true,
  },
  exp: {
    __type: 'number',
    __required: true,
  },
};
