import type { Entity } from '../components';

export interface CameraFollowConfig {
  entity: Entity;
  near: number;
  far: number;
}
export interface CameraServicePrototype {
  getOrientation(): number;
  follow(config: CameraFollowConfig): void;
  update(): void;
}
