import type { Texture } from 'three';

export interface DensityMapPrototype {
  getPixelArray(texture: Texture, color: 'r' | 'g' | 'b'): number[];
}
