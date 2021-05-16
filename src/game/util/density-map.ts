import type { DensityMapPrototype } from '../types';
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
      const imageData = getImageData(texture);
      const output: number[] = [];
      const indexOffset =
        color === 'r' ? 0 : color === 'g' ? 1 : color === 'b' ? 2 : 0;
      for (let i = indexOffset; i < imageData.data.length; i += 4) {
        output.push(imageData.data[i]);
      }
      return output;
    },
  };
}

export const DensityMap = densityMap();
