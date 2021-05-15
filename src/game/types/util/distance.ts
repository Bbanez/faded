import type { Group } from 'three';
import type { Point2D } from '../point';

export interface DistanceUtilPrototype {
  ground: {
    setGeometry(groundGeometry: Group): void;
    height(point: Point2D): number;
  };
}
