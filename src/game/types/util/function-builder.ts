import type { Point2D, Point3D } from '../point';

export type FN2D = (x: number) => number;
export type FN3D = (x: number, y: number) => number;
export interface FunctionBuilderPrototype {
  linear: {
    d2d(points: Point2D[]): FN2D;
    d3d(points: Point3D[]): FN3D;
  };
}
