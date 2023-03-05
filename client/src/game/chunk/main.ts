import { Graphics, type Container } from 'pixi.js';
import { Config } from '../config';

export class Chunk {
  public g: Graphics;

  constructor(
    public readonly type: 'solid' | 'platform',
    public position: [number, number],
    public index: [number, number],
    public container: Container,
    public displayColor: number,
  ) {
    this.g = new Graphics();
    this.createG(false);
  }

  private createG(highlight: boolean) {
    this.g.beginFill(this.displayColor);
    if (highlight) {
      this.g.lineStyle({
        color: 0xffff00,
        alpha: 1,
        width: 1,
      });
    }
    this.g.drawRect(
      this.position[0],
      this.position[1],
      Config.chunkSize,
      Config.chunkSize,
    );
    this.g.endFill();
  }

  show() {
    this.container.addChild(this.g);
  }

  hide() {
    this.container.removeChild(this.g);
  }

  highlight() {
    this.g.clear();
    this.g.beginFill(0x000000, 0);
    this.g.lineStyle({
      color: 0xffff00,
      alpha: 1,
      width: 1,
    });
    this.g.drawRect(
      this.position[0],
      this.position[1],
      Config.chunkSize,
      Config.chunkSize,
    );
    this.g.endFill();
  }

  disableHighlight() {
    this.g.clear();
  }
}
