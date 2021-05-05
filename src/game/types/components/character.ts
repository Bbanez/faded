import type { PositionVector } from '../vector';
import type { BoxDimensions } from '../bounding-box';

// eslint-disable-next-line no-shadow
export enum CharacterRace {
  HUMAN = 'HUMAN',
  ANKY = 'ANKY',
}
// eslint-disable-next-line no-shadow
export enum CharacterClass {
  RANGER = 'RANGER', // HUMAN, ANKY
  MEMIST = 'MEMIST', // ANKY
  GLADIATOR = 'GLADIATOR', // HUMAN
  PROTECTOR = 'PROTECTOR', // HUMAN, ANKY
  SHAMAN = 'SHAMAN', // HUMAN, ANKY
}
// eslint-disable-next-line no-shadow
export enum CharacterSubclass {
  /**
   * RANGER
   */
  ARCHER = 'ARCHER', // DPS
  MARKSMEN = 'MARKSMAN', // BUFF+DPS
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
   * PROTECTOR
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
