import type { Texture } from 'three';

function getImageData(texture: Texture) {
  const canvas = document.createElement('canvas');
  canvas.width = texture.image.width;
  canvas.height = texture.image.height;

  const context = canvas.getContext('2d');
  if (!context) {
    throw Error('getImageData -> Context is null');
  }
  context.drawImage(texture.image, 0, 0);

  return context.getImageData(0, 0, texture.image.width, texture.image.height);
}

export function getPixelMatrixFromTexture(
  texture: Texture,
  channel: 0 | 1 | 2 | 3,
): number[][] {
  const imageData = getImageData(texture);
  const imageWidth = imageData.width;
  const imageHeight = imageData.height;
  let x = 0;
  let z = 0;
  const output: number[][] = [[]];
  for (let i = channel; i < imageData.data.length; i += 4) {
    const pixelData = imageData.data[i];
    output[z].push(pixelData);
    x++;
    if (x === imageWidth) {
      x = 0;
      z++;
      if (z === imageHeight) {
        z = 0;
        break;
      } else {
        output.push([]);
      }
    }
  }
  return output;
}
