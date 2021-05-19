import type { Group } from 'three';
import type { Storage } from '../services';

export interface HeightMapConfigLimits {
  start: number;
  end: number;
}
export interface HeightMapConfig {
  id: string;
  storage: Storage;
  group: Group;
  x: HeightMapConfigLimits;
  z: HeightMapConfigLimits;
  stepSize: {
    x: number;
    z: number;
  };
}
export interface HeightMap {
  get(x: number, z: number): number;
  getSize(): { x: number; z: number };
  getStepSize(): { x: number; z: number };
  getLimits(): { x: HeightMapConfigLimits; z: HeightMapConfigLimits };
}
