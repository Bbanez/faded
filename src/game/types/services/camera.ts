import type { Entity } from '../components';

export interface CameraFollowConfig {
  entity: Entity;
  near: number;
  far: number;
}
export interface CameraServicePrototype {
  follow(config: CameraFollowConfig): void;
  update(): void;
}
