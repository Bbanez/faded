import type { Container } from 'pixi.js';
import { Config } from './config';
import { Keyboard, KeyboardEventType } from './keyboard';
import { Map, type MapChunksOutput } from './map';
import { MathUtil } from './math';
import { FunctionBuilder } from './math/function-builder';
import { Ticker } from './ticker';

export class Player {
  private fallSpeed = 3;
  private width = 0;
  private height = 0;
  private accDamp: [number, number] = [0, 0];
  private acc: [number, number] = [0, 0];
  private speed: [number, number] = [0, 0];
  private unsubs: Array<() => void> = [];
  private position: [number, number] = [1, 1];
  private jumpData = {
    ticks: 0,
    maxTicks: 13,
    strength: 1.1,
    ticksToAccFn: FunctionBuilder.linear2D([
      [0, 1.1],
      [13, 0],
      [14, 0],
    ]),
    active: false,
  };
  private surroundingChunks: MapChunksOutput | null = null;

  constructor(
    public container: Container,
    private ps: number = 2,
    disableKeyboard?: boolean,
    accDamp?: [number, number],
  ) {
    const bb = this.container.getBounds();
    this.width = bb.width;
    this.height = bb.height;
    this.container.position.set(
      this.position[0] + window.innerWidth / 2 - this.width / 2,
      this.position[1] + window.innerHeight / 2 - this.height / 2,
    );
    this.accDamp = accDamp || [0.7, 0.9];
    if (!disableKeyboard) {
      this.unsubs.push(
        Keyboard.subscribe(KeyboardEventType.KEY_DOWN, (state) => {
          console.log(state);
          if (state.d) {
            this.acc[0] = this.ps;
          }
          if (state.a) {
            this.acc[0] = -this.ps;
          }
          if (state[' ']) {
            this.jumpData.active = true;
          }
          if (state.w) {
            this.acc[1] = -this.ps * 0.4;
          }
          if (state.s) {
            this.acc[1] = this.ps * 0.4;
          }
        }),
        Keyboard.subscribe(KeyboardEventType.KEY_UP, (state) => {
          if (!state.a && !state.d) {
            this.acc[0] = 0;
          } else if (!state.a && state.d) {
            this.acc[0] = this.ps;
          } else if (state.a && !state.d) {
            this.acc[0] = -this.ps;
          }
          if (!state.w && !state.s) {
            this.acc[1] = 0;
          }
          if (!state[' ']) {
            this.jumpData.active = false;
          }
        }),
      );
    }
    this.unsubs.push(
      Ticker.subscribe(() => {
        this.calcPosition();
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
    if (this.jumpData.active) {
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
      if (this.acc[1] === 0) {
        this.jumpData.ticks = 0;
        this.acc[1] = 0;
      }
    }
    this.speed[0] = (this.speed[0] + this.acc[0]) * this.accDamp[0];
    this.speed[1] =
      (this.speed[1] + this.acc[1] + this.fallSpeed) * this.accDamp[1];
    if (
      (this.position[0] <= 0 && this.acc[0] <= 0) ||
      (this.position[0] > Map.mapData.width * 64 - this.container.width &&
        this.acc[0] >= 0)
    ) {
      this.speed[0] = 0;
    }
    if (
      (this.position[1] <= 0 && this.acc[1] <= 0) ||
      (this.position[1] >=
        Map.mapData.height * Config.chunkSize - this.height &&
        this.acc[1] >= 0)
    ) {
      this.speed[1] = 0;
    }
    this.position[1] += this.speed[1];
    this.position[0] += this.speed[0];
    this.surroundingChunks = Map.getChunks(this.position, this.speed);
    if (this.surroundingChunks.bottomChunk && !this.jumpData.active) {
      if (
        this.surroundingChunks.bottomChunk[1] <=
        this.position[1] + this.height / 2
      ) {
        this.position[1] =
          this.surroundingChunks.bottomChunk[1] - this.height / 2;
        this.speed[1] = 0;
      }
      if (this.surroundingChunks.rightChunk) {
        console.log(this.surroundingChunks.rightChunk, this.position);
      }
    }
    if (this.speed[0] !== 0 || this.speed[1] !== 0) {
      // console.log(this.position);
    }
    Map.recalcPosition(...this.position);
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
  }
}
