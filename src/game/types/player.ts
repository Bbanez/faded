import type { EntityConfig } from 'svemir/types';
import type { Group } from 'three';

export interface PlayerModel {
  main: Group;
  idle: Group;
  sRun: Group;
  back: Group;
  left: Group;
  right: Group;
}

export interface PlayerConfig extends EntityConfig {
  model: PlayerModel;
}

export interface PlayerCreateConfig {
  playerId: string;
}
