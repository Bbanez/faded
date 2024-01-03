import { RustBaseStats, RustCharacterStats, RustGameObject } from './object';

export interface RustPlayer {
  base_stats: RustBaseStats;
  stats: RustCharacterStats;
  angle: number;
  motion: [number, number];
  obj: RustGameObject;
  map_size: [number, number];
  pointing_at: [number, number];
  pointing_at_angle: [number, number];
}
