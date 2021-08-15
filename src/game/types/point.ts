import type { Orientation2D, Orientation3D } from './orientation';

export interface Point2D {
  x: number;
  y: number;
}
export interface Point3D extends Point2D {
  z: number;
}
export interface PO2D {
  position: Point2D;
  orientation: Orientation2D;
}
export interface PO3D {
  position: Point3D;
  orientation: Orientation3D;
}
