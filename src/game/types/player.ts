import type { EntityConfig } from 'svemir/types';
import type { Group, Mesh, Object3D } from 'three';

export interface PlayerModel {
  main: Group;
  idle: Group;
  sRun: Group;
  back: Group;
  left: Group;
  right: Group;
  bra: Group;
}

export interface PlayerConfig extends EntityConfig {
  model: PlayerModel;
  ground: Object3D | Group | Mesh;
  disableControls?: boolean;
}

export interface PlayerCreateConfig {
  characterId: string;
  ground: Object3D | Group | Mesh;
  disableControls?: boolean;
}
