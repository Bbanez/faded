import type { Point3D } from './point';

export interface BoxDimensions {
  width: number;
  height: number;
  depth: number;
}
export interface BoundingBox extends BoxDimensions {
  corners: {
    top: {
      front: {
        left: Point3D;
        right: Point3D;
      };
      back: {
        left: Point3D;
        right: Point3D;
      };
    };
    bottom: {
      front: {
        left: Point3D;
        right: Point3D;
      };
      back: {
        left: Point3D;
        right: Point3D;
      };
    };
  };
  position: Point3D;
  coordinateDelta: Point3D;
}
