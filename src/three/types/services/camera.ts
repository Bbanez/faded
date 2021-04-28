import type { Vector3 } from 'three';

export interface CameraFollowConfig {
  object: {
    position: Vector3;
  };
  near: number;
  far: number;
}
export interface CameraServicePrototype {
  follow(config: CameraFollowConfig): void;
}
