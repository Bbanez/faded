import type { Vector3, Euler } from 'three';

export interface ControlEngineObject {
  position: Vector3;
  rotation: Euler;
}
export interface ControlEnginePrototype {
  controlObject(object: ControlEngineObject): void;
  update(): void;
}
