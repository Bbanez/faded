import type { PerspectiveCamera } from 'three';
import type { Player } from '../player';

export interface Camera {
  cam: PerspectiveCamera;
  destroy(): Promise<void>;
}

export interface CameraConfig {
  player: Player;
}
