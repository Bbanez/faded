import type { Vector3, Euler, Group } from 'three';

export interface ControlEngineObject {
  position: Vector3;
  rotation: Euler;
}
export interface ControlEnginePrototype {
  controlObject(object: ControlEngineObject): void;
  setTerrain(terrain: Group): void;
  update(): void;
}
