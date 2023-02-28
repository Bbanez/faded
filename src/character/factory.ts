import { Types } from 'mongoose';
import type {
  Character,
  CharacterClass,
  CharacterRace,
  CharacterStats,
} from './models';

export class CharacterFactory {
  static instance(data: {
    name?: string;
    mapId?: string;
    classId?: string;
    raceId?: string;
    userId?: string;
    location?: [number, number];
    level?: number;
    stats?: CharacterStats;
  }): Character {
    return {
      _id: `${new Types.ObjectId()}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      classId: data.classId || '',
      level: data.level || 0,
      location: data.location || [0, 0],
      mapId: data.mapId || '',
      name: data.name || '',
      raceId: data.raceId || '',
      userId: data.userId || '',
      stats: data.stats || {
        agi: 0,
        int: 0,
        speed: 0,
        str: 0,
      },
    };
  }

  static class(data: {
    name?: string;
    animations?: string[];
    str?: number;
    int?: number;
    agi?: number;
  }): CharacterClass {
    return {
      _id: `${new Types.ObjectId()}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      agi: data.agi || 0,
      animations: data.animations || [],
      int: data.int || 0,
      name: data.name || '',
      str: data.str || 0,
    };
  }

  static race(data: {
    name?: string;
    baseModel?: string;
    model?: string;
  }): CharacterRace {
    return {
      _id: `${new Types.ObjectId()}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      baseModel: data.baseModel || '',
      model: data.model || '',
      name: data.name || '',
    };
  }
}
