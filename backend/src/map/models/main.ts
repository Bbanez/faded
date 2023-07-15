import type { Position } from '@backend/types';
import type { ObjectSchema } from '@banez/object-utility/types';
import { MongoDBEntry, MongoDBEntrySchema } from 'servaljs-mongodb';

export type MapChunkType = 'edge' | 'edge-corner' | 'ground' | 'none';

export interface MapChunk {
  type: MapChunkType;
  asset: string;
}
export const MapChunkSchema: ObjectSchema = {
  type: {
    __type: 'string',
    __required: true,
  },
  asset: {
    __type: 'string',
    __required: true,
  },
};

export interface MapColumn {
  rows: MapChunk[];
}
export const MapColumnSchema: ObjectSchema = {
  rows: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'object',
      __content: MapChunkSchema,
    },
  },
};

export interface MapData {
  level1: MapColumn[];
  level2?: MapColumn[];
  level3?: MapColumn[];
}
export const MapDataSchema: ObjectSchema = {
  level1: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'object',
      __content: MapColumnSchema,
    },
  },
  level2: {
    __type: 'array',
    __required: false,
    __child: {
      __type: 'object',
      __content: MapColumnSchema,
    },
  },
  level3: {
    __type: 'array',
    __required: false,
    __child: {
      __type: 'object',
      __content: MapColumnSchema,
    },
  },
};

export interface Map extends MongoDBEntry {
  size: Position;
  data: MapData;
}
export const MapSchema: ObjectSchema = {
  ...MongoDBEntrySchema,
  size: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'number',
    },
  },
  data: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'object',
      __content: MapDataSchema,
    },
  },
};
