import type { Container } from 'pixi.js';
import type { Chunk } from './chunk';
import { Config } from './config';
import { CHUNK_HALF } from './consts';
import type { ChunkSpriteMeta } from './data';
import { Keyboard, KeyboardEventType } from './keyboard';
import { Map, type MapChunksOutput } from './map';
import {
  isVisible,
  MathUtil,
  screenToWorldSpace,
  worldPositionToChunk,
} from './math';
import { FunctionBuilder } from './math/function-builder';
import { Mouse, MouseEventType } from './mouse';
import { Ticker } from './ticker';

export class Player {
  private fallSpeed = 1.6;
  private width = 0;
  private height = 0;
  private accDamp: [number, number] = [0, 0];
  private acc: [number, number] = [0, 0];
  private speed: [number, number] = [0, 0];
  private unsubs: Array<() => void> = [];
  private jumpData = {
    ticks: 0,
    maxTicks: 10,
    strength: 0.5,
    ticksToAccFn: FunctionBuilder.linear2D([
      [0, 0.5],
      [13, 0],
      [14, 0],
    ]),
    active: false,
  };
  private surroundingChunks: MapChunksOutput | null = null;

  public position: [number, number] = [1, 1];
  public positionOffset: [number, number] = [0, 0];

  constructor(
    public container: Container,
    private ps: number = 2,
    disableKeyboard?: boolean,
    accDamp?: [number, number],
  ) {
    this.position[0] = 900;
    this.position[1] = 200;
    const bb = this.container.getBounds();
    this.width = bb.width;
    this.height = bb.height;
    this.container.position.set(
      window.innerWidth / 2 - this.width / 2,
      window.innerHeight / 2 - this.height / 2,
    );
    this.accDamp = accDamp || [0.7, 0.9];
    if (!disableKeyboard) {
      this.unsubs.push(
        Keyboard.subscribe(KeyboardEventType.KEY_DOWN, (state) => {
          if (state.d) {
            this.acc[0] = this.ps;
          }
          if (state.a) {
            this.acc[0] = -this.ps;
          }
          if (state[' ']) {
            this.jumpData.active = true;
          }
          // if (state.w) {
          //   this.acc[1] = -this.ps * 0.4;
          // }
          // if (state.s) {
          //   this.acc[1] = this.ps * 0.4;
          // }
        }),
        Keyboard.subscribe(KeyboardEventType.KEY_UP, (state) => {
          if (!state.a && !state.d) {
            this.acc[0] = 0;
          } else if (!state.a && state.d) {
            this.acc[0] = this.ps;
          } else if (state.a && !state.d) {
            this.acc[0] = -this.ps;
          }
          // if (!state.w && !state.s) {
          //   this.acc[1] = 0;
          // }
          if (!state[' ']) {
            this.jumpData.active = false;
            this.jumpData.ticks = 0;
          }
        }),
      );
    }
    this.unsubs.push(
      Ticker.subscribe(() => {
        this.calcPosition();
      }),
      Mouse.subscribe(MouseEventType.MOUSE_DOWN, (state) => {
        const worldPos = screenToWorldSpace(state.x, state.y, this);
        const chunkIndex = worldPositionToChunk(...worldPos);
        const chunk = Map.solidChunks[chunkIndex[1]][chunkIndex[0]];
        if (chunk) {
          const lc = Map.solidChunks[chunk.index[1]][chunk.index[0] - 1];
          const rc = Map.solidChunks[chunk.index[1]][chunk.index[0] + 1];
          const tc = Map.solidChunks[chunk.index[1] - 1]
            ? Map.solidChunks[chunk.index[1] - 1][chunk.index[0]]
            : null;
          const bc = Map.solidChunks[chunk.index[1] + 1]
            ? Map.solidChunks[chunk.index[1] + 1][chunk.index[0]]
            : null;
          let type: keyof ChunkSpriteMeta;
          if (!lc && !tc && rc && bc) {
            type = 'stl';
          } else if (lc && !tc && rc && bc) {
            type = 'stm';
          } else if (lc && !tc && !rc && bc) {
            type = 'str';
          } else if (!lc && tc && rc && bc) {
            type = 'sml';
          } else if (lc && tc && rc && bc) {
            type = 'smm';
          } else if (lc && tc && !rc && bc) {
            type = 'smr';
          } else if (!lc && tc && rc && !bc) {
            type = 'sbl';
          } else if (lc && tc && rc && !bc) {
            type = 'sbm';
          } else {
            type = 'sbr';
          }
          console.log(type);
        }
        console.log(worldPos, chunkIndex, isVisible(...worldPos, this));
      }),
    );
  }

  moveBy(x?: number, y?: number): void {
    if (x) {
      this.position[0] += x;
      // this.container.x += x;
    }
    if (y) {
      this.position[1] += y;
      // this.container.y += y;
    }
  }

  calcPosition(): void {
    if (this.jumpData.active && this.speed[1] <= 0) {
      if (this.jumpData.ticks === 0) {
        this.acc[1] = 0;
        this.speed[1] = -this.fallSpeed;
      }
      this.acc[1] -= this.jumpData.ticksToAccFn(this.jumpData.ticks);
      this.jumpData.ticks++;
      if (this.jumpData.ticks > this.jumpData.maxTicks) {
        this.jumpData.active = false;
        this.jumpData.ticks = 0;
        this.acc[1] = 0;
      }
    } else {
      this.acc[1] = this.fallSpeed;
      if (this.acc[1] <= 0) {
        this.jumpData.ticks = 0;
      }
    }
    this.speed[0] = (this.speed[0] + this.acc[0]) * this.accDamp[0];
    this.speed[1] = (this.speed[1] + this.acc[1]) * this.accDamp[1];
    if (this.speed[0] > 0 && this.surroundingChunks) {
      const chunk = this.surroundingChunks.right.find((e) => e);
      if (
        chunk &&
        this.position[0] + Config.chunkSize / 2 + this.speed[0] >
          chunk.position[0]
      ) {
        this.speed[0] = 0;
      }
    }
    if (this.speed[0] < 0 && this.surroundingChunks) {
      const chunk = this.surroundingChunks.left.find((e) => e);
      if (
        chunk &&
        this.position[0] - Config.chunkSize / 2 + this.speed[0] <
          chunk.position[0] + Config.chunkSize
      ) {
        this.speed[0] = 0;
      }
    }
    if (this.speed[1] > 0 && this.surroundingChunks) {
      const bottomChunk =
        this.surroundingChunks.bottom[0] || this.surroundingChunks.bottom[1];
      if (
        bottomChunk &&
        this.position[1] + Config.chunkSize * 1.25 + this.speed[1] >
          bottomChunk.position[1]
      )
        this.speed[1] = 0;
    }
    if (
      this.speed[1] < 0 &&
      this.surroundingChunks?.top[0] &&
      this.position[1] - Config.chunkSize * 1.25 + this.speed[1] <
        this.surroundingChunks.top[0].position[1] + Config.chunkSize
    ) {
      this.speed[1] = 0;
      this.jumpData.ticks = 100;
    }
    if (
      (this.position[0] <= 0 && this.acc[0] <= 0) ||
      (this.position[0] > Map.sizeInPixels[0] - this.container.width &&
        this.acc[0] >= 0)
    ) {
      this.speed[0] = 0;
    }
    if (
      (this.position[1] <= 0 && this.acc[1] <= 0) ||
      (this.position[1] >= Map.sizeInPixels[1] - this.height &&
        this.acc[1] >= 0)
    ) {
      this.speed[1] = 0;
    }
    this.position[1] += this.speed[1];
    this.position[0] += this.speed[0];
    this.recalcChunks();
    this.positionOffset = Map.recalcPosition(...this.position);
    this.container.position.set(
      -this.positionOffset[0] + window.innerWidth / 2 - CHUNK_HALF,
      -this.positionOffset[1] +
        window.innerHeight / 2 -
        Config.chunkSize * 1.25,
    );
  }

  recalcChunks() {
    this.surroundingChunks = Map.getChunks(this.position, this.speed);
    if (!this.jumpData.active) {
      const chunk =
        this.surroundingChunks.bottom[0] || this.surroundingChunks.bottom[1];
      if (chunk) {
        if (this.position[1] + Config.chunkSize * 1.25 > chunk.position[1]) {
          this.position[1] = chunk.position[1] - Config.chunkSize * 1.25;
          this.speed[1] = 0;
        }
      }
    }
    if (
      this.surroundingChunks.right[0] ||
      this.surroundingChunks.right[1] ||
      (!this.surroundingChunks.bottom.find((e) => e) &&
        this.surroundingChunks.right[2])
    ) {
      const chunk =
        this.surroundingChunks.right[0] ||
        (this.surroundingChunks.right[1] as Chunk) ||
        this.surroundingChunks.right[2];
      if (this.position[0] + Config.chunkSize / 2 + 1 > chunk.position[0]) {
        this.position[0] = chunk.position[0] - Config.chunkSize / 2 - 1;
        this.speed[0] = 0;
      }
    }
    if (
      this.surroundingChunks.left[0] ||
      this.surroundingChunks.left[1] ||
      (!this.surroundingChunks.bottom.find((e) => e) &&
        this.surroundingChunks.left[2])
    ) {
      const chunk =
        this.surroundingChunks.left[0] ||
        (this.surroundingChunks.left[1] as Chunk) ||
        this.surroundingChunks.left[2];
      if (
        chunk.position[0] + Config.chunkSize >
        this.position[0] - Config.chunkSize / 2 - 1
      ) {
        this.position[0] =
          chunk.position[0] + Config.chunkSize + Config.chunkSize / 2 + 1;
        this.speed[0] = 0;
      }
    }
    if (this.surroundingChunks.top[0]) {
      const chunk = this.surroundingChunks.top[0];
      if (
        this.position[1] - Config.chunkSize * 1.25 <
        chunk.position[1] + Config.chunkSize
      ) {
        this.position[1] = chunk.position[1] + Config.chunkSize * 2.25;
      }
    }
  }

  moveTo(x?: number, y?: number): void {
    if (x) {
      this.position[0] = x;
      // this.container.x = x;
    }
    if (y) {
      this.position[1] = y;
      // this.container.y = y;
    }
  }

  rotateBy(angle: number): void {
    this.container.angle += angle;
  }

  rotateByDeg(angle: number): void {
    this.container.angle += MathUtil.degToRad(angle);
  }

  rotateTo(angle: number): void {
    this.container.angle = angle;
  }

  rotateToDeg(angle: number): void {
    this.container.angle = MathUtil.degToRad(angle);
  }

  destroy() {
    this.unsubs.forEach((e) => e());
    this.container.destroy();
  }
}