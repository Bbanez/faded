import { Container, Graphics } from 'pixi.js';
import { Config } from '../config';
import { Game } from '../main';
import { FunctionBuilder, type Linear2DFn } from '../math/function-builder';
import { getMapChunkData } from '../util';

export interface MapChunksOutput {
  bottomChunk: [number, number] | null;
  leftChunk: [number, number] | null;
  rightChunk: [number, number] | null;
  topChunk: [number, number] | null;
}

export class Map {
  static container = new Container();
  static mapContainer = new Container();
  static locked = [false, false];
  static mapData: {
    solidChunks: boolean[][];
    platformChunks: boolean[][];
    width: number;
    height: number;
  };
  static chunkFn: Linear2DFn;
  static bp = new Graphics();

  static async load(_id: string): Promise<void> {
    Map.bp.beginFill(0x00ff00);
    Map.bp.drawCircle(0, 0, 3);
    Map.bp.endFill();
    Map.destroy();
    Map.container = new Container();
    const bg = new Graphics();
    bg.zIndex = -2;
    bg.beginFill(0x220055);
    bg.drawRect(0, 0, window.innerWidth, window.innerHeight);
    bg.endFill();
    Map.container.addChild(bg);
    const mapData = await getMapChunkData('/map/test.png');
    if (!mapData) {
      throw Error('Failed to load map data.');
    }
    Map.mapData = mapData;
    const solidContainer = new Container();
    const platformContainer = new Container();
    for (let y = 0; y < mapData.solidChunks.length; y++) {
      for (let x = 0; x < mapData.solidChunks[y].length; x++) {
        const sValue = mapData.solidChunks[y][x];
        const pValue = mapData.platformChunks[y][x];
        if (sValue) {
          const rect = new Graphics();
          rect.beginFill(0xff0000);
          rect.drawRect(
            x * Config.chunkSize,
            y * Config.chunkSize,
            Config.chunkSize,
            Config.chunkSize,
          );
          rect.endFill();
          solidContainer.addChild(rect);
        }
        if (pValue) {
          const rect = new Graphics();
          rect.beginFill(0x0000ff);
          rect.drawRect(
            x * Config.chunkSize,
            y * Config.chunkSize,
            Config.chunkSize,
            Config.chunkSize,
          );
          rect.endFill();
          platformContainer.addChild(rect);
        }
      }
    }
    Map.container.addChild(solidContainer);
    Map.container.addChild(platformContainer);
    Map.mapContainer = new Container();
    Map.mapContainer.addChild(solidContainer);
    Map.mapContainer.addChild(platformContainer);
    Map.mapContainer.addChild(Map.bp);
    Game.app.stage.addChild(Map.mapContainer);
    Map.mapContainer.position.set(
      0,
      window.innerHeight - mapData.height * Config.chunkSize,
    );
    Map.chunkFn = FunctionBuilder.linear2D([
      [0, 0],
      [Config.chunkSize, 1],
    ]);
  }

  static recalcPosition(x: number, y: number): void {
    const pos = [-x + window.innerWidth / 2, -y + window.innerHeight / 2];
    Map.mapContainer.x = pos[0];
    if (
      x > 0 + window.innerWidth / 2 &&
      x < Map.mapData.width * Config.chunkSize - window.innerWidth / 2
    ) {
      Map.locked[0] = false;
    } else {
      Map.locked[0] = true;
    }
    Map.mapContainer.y = pos[1];
    if (
      y > 0 + window.innerHeight / 2 &&
      y < Map.mapData.height * Config.chunkSize - window.innerHeight / 2
    ) {
      Map.locked[1] = false;
    } else {
      Map.locked[1] = true;
    }
  }

  static getChunks(
    position: [number, number],
    speed: [number, number],
  ): MapChunksOutput {
    const rawChunks = [
      Map.chunkFn(position[0]),
      Map.chunkFn(position[1] + Config.chunkSize * 1.25),
    ];
    Map.bp.position.set(position[0], position[1] + Config.chunkSize * 1.25);
    const atChunk = [
      parseInt(`${Map.chunkFn(position[0])}`),
      parseInt(`${Map.chunkFn(position[1] + Config.chunkSize * 2.5)}`),
    ];
    const output: MapChunksOutput = {
      bottomChunk: null,
      leftChunk: null,
      rightChunk: null,
      topChunk: null,
    };
    const bottomChunkIndex = atChunk[1] - 1;
    if (speed[1] >= 0) {
      if (
        Map.mapData.solidChunks[bottomChunkIndex] &&
        Map.mapData.solidChunks[bottomChunkIndex][atChunk[0]]
      ) {
        output.bottomChunk = [atChunk[0], bottomChunkIndex];
      }
      if (!output.bottomChunk) {
        if (
          Map.mapData.platformChunks[bottomChunkIndex] &&
          Map.mapData.platformChunks[bottomChunkIndex][atChunk[0]] &&
          bottomChunkIndex + Map.chunkFn(speed[1] * 2) > rawChunks[1]
        ) {
          output.bottomChunk = [atChunk[0], bottomChunkIndex];
        }
      }
    }
    console.log(Map.mapData.solidChunks[atChunk[0] + 1][atChunk[1]]);
    if (
      Map.mapData.solidChunks[atChunk[0] + 1] &&
      Map.mapData.solidChunks[atChunk[0] + 1][atChunk[1]]
    ) {
      output.rightChunk = [atChunk[0] + 1, atChunk[1]];
    }
    for (const _key in output) {
      const key = _key as keyof MapChunksOutput;
      const value = output[key];
      if (value) {
        value[0] = value[0] * Config.chunkSize;
        value[1] = value[1] * Config.chunkSize;
      }
    }
    return output;
  }

  static destroy() {
    Map.container.destroy();
    Map.mapContainer.destroy();
  }
}
