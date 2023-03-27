import {
  BaseTexture,
  Graphics,
  Rectangle,
  Sprite,
  Texture,
  type Container,
} from 'pixi.js';
import { Config } from '../config';
import { PI12 } from '../consts';
import { ChunkSpriteMeta } from '../data';
import { FunctionBuilder, MathUtil } from '../math';

const chunkSpriteScaleFn = FunctionBuilder.linear2D([
  [0, 0],
  [128, 32],
]);
const spriteOverflow = chunkSpriteScaleFn(32);

export class Chunk {
  public g: Graphics;
  public typ: keyof ChunkSpriteMeta = 'none' as never;
  public sprite: Sprite | null = null;

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

  setSprite(texture: BaseTexture, type: keyof ChunkSpriteMeta): void {
    const meta = ChunkSpriteMeta[type];
    const w = meta[1][0] - meta[0][0];
    const h = meta[1][1] - meta[0][1];
    const subTexture = new Texture(
      texture,
      new Rectangle(meta[0][0], meta[0][1], w, h),
    );
    this.typ = type;
    this.sprite = new Sprite(subTexture);
    switch (type) {
      case 'stl':
        {
          this.sprite.position.set(
            this.position[0] - spriteOverflow,
            this.position[1] - spriteOverflow,
          );
        }
        break;
      case 'stm':
        {
          this.sprite.position.set(
            this.position[0],
            this.position[1] - spriteOverflow,
          );
        }
        break;
      case 'str':
        {
          this.sprite.position.set(
            this.position[0],
            this.position[1] - spriteOverflow,
          );
        }
        break;
      case 'sml':
        {
          this.sprite.position.set(
            this.position[0] - spriteOverflow,
            this.position[1],
          );
        }
        break;
      case 'smm':
        {
          const angleMulti = parseInt(
            MathUtil.randomInInRange(0, 3).toFixed(0),
          );
          this.sprite.anchor.set(0.5);
          this.sprite.rotation = PI12 * angleMulti;
          this.sprite.position.set(
            this.position[0] + chunkSpriteScaleFn(this.sprite.width / 2),
            this.position[1] + chunkSpriteScaleFn(this.sprite.height / 2),
          );
        }
        break;
      case 'smr':
        {
          this.sprite.position.set(this.position[0], this.position[1]);
        }
        break;
      case 'sbl':
        {
          this.sprite.position.set(
            this.position[0] - spriteOverflow,
            this.position[1],
          );
        }
        break;
      case 'sbm':
        {
          this.sprite.position.set(this.position[0], this.position[1]);
        }
        break;
      case 'sbr':
        {
          this.sprite.position.set(this.position[0], this.position[1]);
        }
        break;
      case 'sst':
        {
          this.sprite.position.set(
            this.position[0] - spriteOverflow,
            this.position[1] - spriteOverflow,
          );
        }
        break;
      case 'ssb':
        {
          this.sprite.position.set(
            this.position[0] - spriteOverflow,
            this.position[1],
          );
        }
        break;
      case 'ssl':
        {
          this.sprite.position.set(
            this.position[0] - spriteOverflow,
            this.position[1] - spriteOverflow,
          );
        }
        break;
      case 'ssr':
        {
          this.sprite.position.set(
            this.position[0],
            this.position[1] - spriteOverflow,
          );
        }
        break;
      case 'pl':
        {
          this.sprite.position.set(
            this.position[0] - spriteOverflow,
            this.position[1] - spriteOverflow,
          );
        }
        break;
      case 'pm':
        {
          this.sprite.position.set(
            this.position[0],
            this.position[1] - spriteOverflow,
          );
        }
        break;
      case 'pr':
        {
          this.sprite.position.set(
            this.position[0],
            this.position[1] - spriteOverflow,
          );
        }
        break;
    }
    this.sprite.width = chunkSpriteScaleFn(w) + 1;
    this.sprite.height = chunkSpriteScaleFn(h) + 1;
    this.container.addChild(this.sprite);
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
