import { RustBoundingBox } from './bounding_box';

export interface RustGameObject {
  position: [number, number];
  size: [number, number];
  bb: RustBoundingBox;
}

export interface RustBaseStats {
  str: number;
  agi: number;
  int: number;
  hp: number;
  mana: number;
  stamina: number;
  move_speed: number;
  armor: number;
  range: number;
  damage: number;
}

export interface RustCharacterStats {
  str: number;
  agi: number;
  int: number;
  max_hp: number;
  hp: number;
  max_mana: number;
  mana: number;
  max_stamina: number;
  stamina: number;
  move_speed: number;
  attack_speed: number;
  armor: number;
  range: number;
  damage: [number, number];
}
