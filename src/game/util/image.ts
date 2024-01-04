import { Texture } from "three";

export function getImageData(texture: Texture) {
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