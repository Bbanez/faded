import { Graphics } from 'pixi.js';
import { Config } from '../config';

export class PlatformChunk {
  public g: Graphics;

  constructor(public position: [number, number]) {
    this.g = new Graphics();
    this.g.beginFill(0x0000ff);
    this.g.drawRect(
      this.position[0],
      this.position[1],
      Config.chunkSize,
      Config.chunkSize,
    );
    this.g.endFill();
  }
}
