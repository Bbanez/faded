import type { Texture } from 'three';
import type { MatrixXZ } from '../matrix';

export interface DensityMapPrototype {
  getPixelArray(texture: Texture, color: 'r' | 'g' | 'b'): MatrixXZ;
}
