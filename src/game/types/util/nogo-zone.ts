import type { Vector2 } from 'three';
import type { PO2D } from '../point';

export interface NogoZonePoint {
  position: Vector2;
  edges: [boolean, boolean, boolean, boolean];
}

export interface NogoZoneData {
  mapIndex: number;
  points: NogoZonePoint[];
}

export interface NogoZone {
  getPath(data: { from: PO2D; to: PO2D }): (current: PO2D) => PO2D;
}
