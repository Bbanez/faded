import type { PositionVector } from './vector';

export interface BoxDimensions {
  width: number;
  height: number;
  depth: number;
}
export interface BoundingBox extends BoxDimensions {
  corners: {
    top: {
      front: {
        left: PositionVector;
        right: PositionVector;
      };
      back: {
        left: PositionVector;
        right: PositionVector;
      };
    };
    bottom: {
      front: {
        left: PositionVector;
        right: PositionVector;
      };
      back: {
        left: PositionVector;
        right: PositionVector;
      };
    };
  };
  position: PositionVector;
  coordinateDelta: PositionVector;
}
