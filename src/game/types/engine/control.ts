import type { Group } from 'three';
import type { Entity } from '../components';

export interface ControlEnginePrototype {
  controlEntity(entity: Entity): void;
  setTerrain(terrain: Group): void;
  disableDashFor(millis: number): void;
  update(): void;
}
