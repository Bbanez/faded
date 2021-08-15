import type { DensityMapPrototype, MatrixXZ } from '../types';
import type { Texture } from 'three';
import { createErrorHandler } from './error';

export function densityMap(): DensityMapPrototype {
  const error = createErrorHandler('DensityMap');

  function getImageData(texture: Texture) {
    const canvas = document.createElement('canvas');
    canvas.width = texture.image.width;
    canvas.height = texture.image.height;

    const context = canvas.getContext('2d');
    if (!context) {
      throw error.break('getImageData', 'Context is null');
    }
    context.drawImage(texture.image, 0, 0);

    return context.getImageData(
      0,
      0,
      texture.image.width,
      texture.image.height
    );
  }
  return {
    getPixelArray(texture, color) {
      const w2 = texture.image.width / 2;
      const h2 = texture.image.height / 2;
      let x = -w2;
      let z = -h2;
      const imageData = getImageData(texture);
      const indexOffset =
        color === 'r' ? 0 : color === 'g' ? 1 : color === 'b' ? 2 : 0;
      const map: MatrixXZ = {};
      for (let i = indexOffset; i < imageData.data.length; i += 4) {
        if (!map[x]) {
          map[x] = {};
        }
        map[x][z] = imageData.data[i];

        x++;
        if (x > w2 - 1) {
          x = -w2;
          z++;
        }
      }
      return map;
    },
  };
}

export const DensityMap = densityMap();
