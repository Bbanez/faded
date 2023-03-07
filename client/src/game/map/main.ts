import { BaseTexture, Container, Graphics, Sprite } from 'pixi.js';
import { Chunk, PlatformChunk, SolidChunk } from '../chunk';
import { Config } from '../config';
import type { ChunkSpriteMeta } from '../data';
import { Layers } from '../layers';
import { FunctionBuilder, type Linear2DFn } from '../math/function-builder';
import { getMapChunkData } from '../util';

export interface MapChunksOutput {
  bottom: Array<SolidChunk | PlatformChunk | null>;
  top: Array<SolidChunk | PlatformChunk | null>;
  left: Array<SolidChunk | PlatformChunk | null>;
  right: Array<SolidChunk | PlatformChunk | null>;
}

export class Map {
  static locked = [false, false];
  static solidChunks: (SolidChunk | null)[][];
  static platformChunks: (PlatformChunk | null)[][];
  static sizeInChunks: [number, number];
  static sizeInPixels: [number, number];
  static chunkFn: Linear2DFn;
  static bp = new Graphics();
  static currentPosition: [number, number] = [-1000000000, -1];

  static async load(_id: string): Promise<void> {
    Map.bp.beginFill(0x00ff00);
    Map.bp.drawCircle(0, 0, 3);
    Map.bp.endFill();
    Map.destroy();
    const mapData = await getMapChunkData('/map/0/chunk-placement.png');
    // const solidLayer = Sprite.from('/map/test-l0.png');
    const fol1Layer = Sprite.from('/map/0/f1.png');
    const fol2Layer = Sprite.from('/map/0/f2.png');
    const fol3Layer = Sprite.from('/map/0/f3.png');
    Layers[4].addChild(fol3Layer);
    Layers[3].addChild(fol2Layer);
    Layers[2].addChild(fol1Layer);
    // Layers[0].addChild(solidLayer);
    if (!mapData) {
      throw Error('Failed to load map data.');
    }
    Map.sizeInChunks = [mapData.width, mapData.height];
    Map.sizeInPixels = [
      mapData.width * Config.chunkSize,
      mapData.height * Config.chunkSize,
    ];
    Map.solidChunks = [];
    Map.platformChunks = [];
    const chunkSpiteTexture = BaseTexture.from('/map/0/chunks-1.png');
    const solidContainer = new Container();
    const platformContainer = new Container();
    for (let y = 0; y < mapData.solidChunks.length; y++) {
      if (y > 0) {
        Map.solidChunks.push([]);
        Map.platformChunks.push([]);
      }
      for (let x = 0; x < mapData.solidChunks[y].length; x++) {
        if (!Map.solidChunks[y]) {
          Map.solidChunks[y] = [];
          Map.platformChunks[y] = [];
        }
        const sValue = mapData.solidChunks[y][x];
        const pValue = mapData.platformChunks[y][x];
        if (sValue) {
          const chunk = new SolidChunk(
            [x * Config.chunkSize, y * Config.chunkSize],
            [x, y],
            solidContainer,
          );
          Map.solidChunks[y].push(chunk);
          // chunk.show();
        } else {
          Map.solidChunks[y].push(null);
        }
        if (pValue) {
          const chunk = new PlatformChunk(
            [x * Config.chunkSize, y * Config.chunkSize],
            [x, y],
            platformContainer,
          );
          // chunk.show();
          Map.platformChunks[y].push(chunk);
        } else {
          Map.platformChunks[y].push(null);
        }
      }
    }
    for (let y = 0; y < Map.solidChunks.length; y++) {
      const row = Map.solidChunks[y];
      for (let x = 0; x < row.length; x++) {
        const chunk = row[x];
        if (chunk) {
          chunk.setSprite(chunkSpiteTexture, Map.chunkToType(chunk));
        }
      }
    }
    for (let y = 0; y < Map.platformChunks.length; y++) {
      const row = Map.platformChunks[y];
      for (let x = 0; x < row.length; x++) {
        const chunk = row[x];
        if (chunk) {
          chunk.setSprite(chunkSpiteTexture, Map.chunkToType(chunk));
        }
      }
    }
    Layers[0].addChild(solidContainer);
    Layers[2].addChild(platformContainer);
    Layers[0].addChild(Map.bp);
    Map.setBgPos(0, window.innerHeight - mapData.height * Config.chunkSize);
    Map.chunkFn = FunctionBuilder.linear2D([
      [0, 0],
      [Config.chunkSize, 1],
    ]);
  }

  private static setBgPos(x: number, y: number) {
    Layers[0].position.set(x, y);
    Layers[2].position.set(x, y);
    Layers[3].position.set(x, y);
    Layers[4].position.set(x, y);
  }

  static chunkToType(chunk: Chunk) {
    const chunkType =
      chunk instanceof SolidChunk ? 'solidChunks' : 'platformChunks';
    const ltc = Map[chunkType][chunk.index[1] - 1]
      ? Map[chunkType][chunk.index[1] - 1][chunk.index[0] - 1]
      : null;
    const lbc = Map[chunkType][chunk.index[1] + 1]
      ? Map[chunkType][chunk.index[1] + 1][chunk.index[0] - 1]
      : null;
    const lc = Map[chunkType][chunk.index[1]][chunk.index[0] - 1];
    const rc = Map[chunkType][chunk.index[1]][chunk.index[0] + 1];
    const rtc = Map[chunkType][chunk.index[1] - 1]
      ? Map[chunkType][chunk.index[1] - 1][chunk.index[0] + 1]
      : null;
    const rbc = Map[chunkType][chunk.index[1] + 1]
      ? Map[chunkType][chunk.index[1] + 1][chunk.index[0] + 1]
      : null;
    const tc = Map[chunkType][chunk.index[1] - 1]
      ? Map[chunkType][chunk.index[1] - 1][chunk.index[0]]
      : null;
    const bc = Map[chunkType][chunk.index[1] + 1]
      ? Map[chunkType][chunk.index[1] + 1][chunk.index[0]]
      : null;
    let type: keyof ChunkSpriteMeta;
    if (chunkType === 'solidChunks') {
      if (!lc && !ltc && !tc && !rtc && !rc && bc) {
        type = 'sst';
      } else if (!lc && !lbc && !bc && !rbc && !rc && tc) {
        type = 'ssb';
      } else if (!bc && !lbc && !lc && !ltc && !tc && rc) {
        type = 'ssl';
      } else if (!tc && !rtc && !rc && !rbc && !bc && lc) {
        type = 'ssr';
      } else if (!lc && !tc && rc && bc) {
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
    } else {
      if (!lc && !tc && rc && !bc) {
        type = 'pl';
      } else if (lc && !tc && rc && !bc) {
        type = 'pm';
      } else {
        type = 'pr';
      }
    }
    return type;
  }

  static chunkAtIndex(x: number, y: number): Chunk | null {
    return Map.solidChunks[y]
      ? Map.solidChunks[y][x]
        ? Map.solidChunks[y][x]
        : Map.platformChunks[y]
        ? Map.platformChunks[y][x]
        : null
      : null;
  }

  static recalcPosition(x: number, y: number): [number, number] {
    // Map.mapContainer.x = pos[0];
    if (
      x > 0 + window.innerWidth / 2 &&
      x < Map.sizeInPixels[0] - window.innerWidth / 2
    ) {
      Map.locked[0] = false;
    } else {
      Map.locked[0] = true;
    }
    // Map.mapContainer.y = pos[1];
    if (
      y > 0 + window.innerHeight / 2 &&
      y < Map.sizeInPixels[1] - window.innerHeight / 2
    ) {
      Map.locked[1] = false;
    } else {
      Map.locked[1] = true;
    }
    const pos = [-x + window.innerWidth / 2, -y + window.innerHeight / 2];
    const playerOffset: [number, number] = [0, 0];
    if (y + window.innerHeight / 2 > Map.sizeInPixels[1]) {
      const newPos = -Map.sizeInPixels[1] + window.innerHeight;
      playerOffset[1] = pos[1] - newPos;
      pos[1] = newPos;
    } else if (y - window.innerHeight / 2 < 0) {
      playerOffset[1] = pos[1];
      pos[1] = 0;
    }
    if (x + window.innerWidth / 2 > Map.sizeInPixels[0]) {
      const newPos = -Map.sizeInPixels[0] + window.innerWidth;
      playerOffset[0] = pos[0] - newPos;
      pos[0] = newPos;
    } else if (x - window.innerWidth / 2 < 0) {
      playerOffset[0] = pos[0];
      pos[0] = 0;
    }
    if (Map.currentPosition[0] === -1000000000) {
      Map.currentPosition[0] = pos[0];
      Map.currentPosition[1] = pos[1];
    } else {
      const rollSpeed = 16;
      Map.currentPosition[0] += (pos[0] - Map.currentPosition[0]) / rollSpeed;
      Map.currentPosition[1] += (pos[1] - Map.currentPosition[1]) / rollSpeed;
      playerOffset[0] += pos[0] - Map.currentPosition[0];
      playerOffset[1] += pos[1] - Map.currentPosition[1];
    }
    Map.setBgPos(Map.currentPosition[0], Map.currentPosition[1]);
    return playerOffset;
  }

  static getChunks(
    position: [number, number],
    speed: [number, number],
  ): MapChunksOutput {
    // const rawChunks = [
    //   Map.chunkFn(position[0]),
    //   Map.chunkFn(position[1] + Config.chunkSize * 1.25),
    // ];
    Map.bp.position.set(
      position[0],
      position[1] + Config.chunkSize * 1.25 + speed[1],
    );
    const output: MapChunksOutput = {
      bottom: [],
      left: [],
      right: [],
      top: [],
    };
    const inChunk = [
      parseInt(`${Map.chunkFn(position[0])}`),
      parseInt(
        `${Map.chunkFn(position[1] + Config.chunkSize * 1.25 - speed[1] - 1)}`,
      ),
    ];
    const bottomLeftPoint = [
      parseInt(`${Map.chunkFn(position[0] - Config.chunkSize / 2)}`),
      parseInt(`${Map.chunkFn(position[1] + Config.chunkSize * 2.5)}`) - 1,
    ];
    const bottomRightPoint = [
      parseInt(`${Map.chunkFn(position[0] + Config.chunkSize / 2)}`),
      parseInt(`${Map.chunkFn(position[1] + Config.chunkSize * 2.5)}`) - 1,
    ];
    const topChunkIndex = parseInt(
      `${Map.chunkFn(position[1] - Config.chunkSize * 1.25)}`,
    );
    output.bottom.push(
      Map.solidChunks[bottomLeftPoint[1]]
        ? Map.solidChunks[bottomLeftPoint[1]][bottomLeftPoint[0]]
        : null,
      Map.solidChunks[bottomRightPoint[1]]
        ? Map.solidChunks[bottomRightPoint[1]][bottomRightPoint[0]]
        : null,
    );
    output.left.push(
      Map.solidChunks[inChunk[1]]
        ? Map.solidChunks[inChunk[1]][inChunk[0] - 1]
        : null,
      Map.solidChunks[inChunk[1] - 1]
        ? Map.solidChunks[inChunk[1] - 1][inChunk[0] - 1]
        : null,
      Map.solidChunks[inChunk[1] - 2]
        ? Map.solidChunks[inChunk[1] - 2][inChunk[0] - 1]
        : null,
    );
    output.right.push(
      Map.solidChunks[inChunk[1]]
        ? Map.solidChunks[inChunk[1]][inChunk[0] + 1]
        : null,
      Map.solidChunks[inChunk[1] - 1]
        ? Map.solidChunks[inChunk[1] - 1][inChunk[0] + 1]
        : null,
      Map.solidChunks[inChunk[1] - 2]
        ? Map.solidChunks[inChunk[1] - 2][inChunk[0] + 1]
        : null,
    );
    output.top.push(
      Map.solidChunks[topChunkIndex]
        ? Map.solidChunks[topChunkIndex][inChunk[0]]
        : null,
    );
    if (speed[1] >= 0 && !output.bottom[0]) {
      output.bottom[0] = Map.platformChunks[bottomLeftPoint[1]]
        ? Map.platformChunks[bottomLeftPoint[1]][bottomLeftPoint[0]]
        : null;
    }
    if (speed[1] >= 0 && !output.bottom[1]) {
      output.bottom[1] = Map.platformChunks[bottomRightPoint[1]]
        ? Map.platformChunks[bottomRightPoint[1]][bottomRightPoint[0]]
        : null;
    }
    for (let i = 0; i < output.left.length; i++) {
      const leftChunk = output.left[i];
      if (leftChunk && output.bottom[0] && output.bottom[0] === leftChunk) {
        output.bottom[0] = null;
      }
    }
    for (let i = 0; i < output.right.length; i++) {
      const rightChunk = output.right[i];
      if (rightChunk && output.bottom[1] && output.bottom[1] === rightChunk) {
        output.bottom[1] = null;
      }
    }
    // for (let i = 0; i < Map.solidChunks.length; i++) {
    //   for (let j = 0; j < Map.solidChunks[i].length; j++) {
    //     const chunk = Map.solidChunks[i][j];
    //     const pChunk = Map.platformChunks[i][j];
    //     if (chunk) {
    //       chunk.disableHighlight();
    //     }
    //     if (pChunk) {
    //       pChunk.disableHighlight();
    //     }
    //   }
    // }
    // for (const _key in output) {
    //   const key = _key as keyof MapChunksOutput;
    //   if (output[key]) {
    //     output[key].forEach((e) => {
    //       if (e) {
    //         e.highlight();
    //       }
    //     });
    //   }
    // }
    return output;
  }

  static destroy() {
    // Map.mapContainer.destroy();
  }
}