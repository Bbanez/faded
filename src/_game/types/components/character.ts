import type { PositionVector } from '../point';
import type { BoxDimensions } from '../bounding-box';

// eslint-disable-next-line no-shadow
export enum CharacterRace {
  HUMAN = 'HUMAN',
  ANKY = 'ANKY',
}
// eslint-disable-next-line no-shadow
export enum CharacterClass {
  ROGUE = 'ROGUE', // HUMAN, ANKY
  MEMIST = 'MEMIST', // ANKY
  GLADIATOR = 'GLADIATOR', // HUMAN
  KNIGHT = 'KNIGHT', // HUMAN, ANKY
  SHAMAN = 'SHAMAN', // HUMAN, ANKY
}
// eslint-disable-next-line no-shadow
export enum CharacterSubclass {
  /**
   * ROGUE
   */
  ARCHER = 'ARCHER', // DPS+RANGE
  ASSASSIN = 'ASSASSIN', // DPS+MALE
  /**
   * MEMIST
   */
  ENHANCER = 'ENHANCER', // BUFF
  MEISTER = 'MEISTER', // DPS
  /**
   * GLADIATOR
   */
  BERSERK = 'BERSERK', // DPS+AOE
  DUELIST = 'DUELIST', // DPS+SINGLE
  /**
   * KNIGHT
   */
  GUARDIAN = 'GUARDIAN', // TANK
  PALADIN = 'PALADIN', // TANK+HEAL
  /**
   * SHAMAN
   */
  ANKYMAN = 'ANKYMAN', // HEAL+DEFENSE
  CASTER = 'CASTER', // HEAL+ATTACK
}
export interface CharacterStats {
  class: {
    type: CharacterClass;
    subclass?: CharacterSubclass;
  };
  strength: number;
  agility: number;
  wisdom: number;
  constitution: number;
}
export interface CharacterPrototype {
  getHealth(): number;
  getStamina(): number;
  getMana(): number;
  getPosition(): PositionVector;
  getSize(): BoxDimensions;
}
