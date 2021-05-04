import type { PositionVector } from '../vector';
import type { BoxDimensions } from '../bounding-box';

export enum CharacterRace {
  HUMAN =  'HUMAN',
  ELF = 'ELF',
  DWARF = 'DWARF',

}
export type CharacterType = 'archer' | 'assassin' | 'mage' | 'berserk' | ''
export interface CharacterStats {
  type:
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
