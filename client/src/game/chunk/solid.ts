import { Graphics } from 'pixi.js';
import { Config } from '../config';

export class SolidChunk {
  public g: Graphics;

  constructor(public position: [number, number]) {
    this.g = new Graphics();
    this.g.beginFill(0xff0000);
    this.g.drawRect(
      this.position[0],
      this.position[1],
      Config.chunkSize,
      Config.chunkSize,
    );
    this.g.endFill();
  }
}
