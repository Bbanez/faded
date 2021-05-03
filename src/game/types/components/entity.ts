import type { BoundingBox, BoxDimensions } from '../bounding-box';
import type { PositionVector } from '../vector';
import type { Group, Object3D } from 'three';
import type { Euler, Scene, Vector3 } from 'three';

export type EntityObject = Object3D | Group;
export interface Entity {
  object: EntityObject;
  bb: BoundingBox | undefined;
  dimensions: BoxDimensions | undefined;
  coordinateDelta: PositionVector | undefined;
  transformOrigin: (entity: Entity) => void;

  playAnimation(name: string): void;
  addToScene(scene: Scene): void;
  removeFromScene(scene: Scene): void;
  enableBBVisual(scene: Scene): void;
  disableBBVisual(scene: Scene): void;
  update(
    position?: Vector3 | PositionVector,
    rotation?: Euler | PositionVector
  ): void;
  updateAnimationMixer(t: number): void;
  updateBoundingBox(): void;
  setObject(object: EntityObject): void;
  getObject(): EntityObject;
  setBB(bb: BoundingBox): void;
  getBB(): BoundingBox | undefined;
  setPosition(position: Vector3 | PositionVector): void;
  getPosition(): Vector3;
  setRotation(rotation: Euler | PositionVector): void;
  getRotation(): Euler;
  setDimensions(dimensions: BoxDimensions): void;
  getDimensions(): BoxDimensions | undefined;
  setCoordinateDelta(delta: PositionVector): void;
  getCoordinateDelta(): PositionVector | undefined;
}
