import type { BoundingBox, BoxDimensions } from '../bounding-box';
import type { Point3D } from '../point';
import type { Group, Object3D } from 'three';
import type { Euler, Scene, Vector3 } from 'three';

export type EntityObject = Object3D | Group;
export interface Entity {
  object: EntityObject;
  bb: BoundingBox | undefined;
  dimensions: BoxDimensions | undefined;
  coordinateDelta: Point3D | undefined;
  transformOrigin: (entity: Entity) => void;

  playAnimation(name: string): void;
  addToScene(scene: Scene): void;
  removeFromScene(scene: Scene): void;
  enableBBVisual(scene: Scene): void;
  disableBBVisual(scene: Scene): void;
  update(position?: Vector3 | Point3D, rotation?: Euler | Point3D): void;
  updateAnimationMixer(t: number): void;
  updateBoundingBox(): void;
  setObject(object: EntityObject): void;
  getObject(): EntityObject;
  setBB(bb: BoundingBox): void;
  getBB(): BoundingBox | undefined;
  setPosition(position: Vector3 | Point3D): void;
  getPosition(): Vector3;
  setRotation(rotation: Euler | Point3D): void;
  getRotation(): Euler;
  setDimensions(dimensions: BoxDimensions): void;
  getDimensions(): BoxDimensions | undefined;
  setCoordinateDelta(delta: Point3D): void;
  getCoordinateDelta(): Point3D | undefined;
}
