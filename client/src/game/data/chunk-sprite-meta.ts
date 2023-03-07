export type ChunkSpriteMetaItem = [[number, number], [number, number]];

export interface ChunkSpriteMeta {
  stl: ChunkSpriteMetaItem;
  stm: ChunkSpriteMetaItem;
  str: ChunkSpriteMetaItem;
  sml: ChunkSpriteMetaItem;
  smm: ChunkSpriteMetaItem;
  smr: ChunkSpriteMetaItem;
  sbl: ChunkSpriteMetaItem;
  sbm: ChunkSpriteMetaItem;
  sbr: ChunkSpriteMetaItem;
  sst: ChunkSpriteMetaItem;
  ssr: ChunkSpriteMetaItem;
  ssb: ChunkSpriteMetaItem;
  ssl: ChunkSpriteMetaItem;
  pl: ChunkSpriteMetaItem;
  pm: ChunkSpriteMetaItem;
  pr: ChunkSpriteMetaItem;
}

export const ChunkSpriteMeta: ChunkSpriteMeta = {
  stl: [
    [20, 20],
    [180, 180],
  ],
  stm: [
    [264, 20],
    [392, 180],
  ],
  str: [
    [476, 20],
    [636, 180],
  ],
  sml: [
    [20, 264],
    [180, 392],
  ],
  smm: [
    [264, 264],
    [392, 392],
  ],
  smr: [
    [476, 264],
    [636, 392],
  ],
  sbl: [
    [20, 476],
    [180, 636],
  ],
  sbm: [
    [264, 476],
    [392, 636],
  ],
  sst: [
    [656, 20],
    [848, 180],
  ],
  ssb: [
    [868, 52],
    [1060, 212],
  ],
  ssl: [
    [1080, 20],
    [1240, 212],
  ],
  ssr: [
    [688, 232],
    [848, 424],
  ],
  sbr: [
    [476, 476],
    [636, 636],
  ],
  pl: [
    [656, 444],
    [816, 636],
  ],
  pm: [
    [900, 444],
    [1028, 636],
  ],
  pr: [
    [1112, 444],
    [1272, 636],
  ],
};
