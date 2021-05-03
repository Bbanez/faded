import type { Euler, Vector3 } from 'three';
import type { BoundingBox, BoxDimensions, PositionVector } from '../types';
import { PI12, PI14, PI34 } from '../const';

export class BoundingBoxFactory {
  static fromDimensions(
    config: {
      delta: PositionVector;
      pos: Vector3 | PositionVector;
      rotation: Euler | PositionVector;
    } & BoxDimensions
  ): BoundingBox {
    const a2 = config.width / 2;
    const b2 = config.depth / 2;
    const fi = config.rotation.y;
    const F: PositionVector = {
      x:
        config.pos.x +
        config.delta.x * a2 * Math.cos(fi) +
        config.delta.z * b2 * Math.cos(fi + PI12),
      y: 0,
      z:
        config.pos.z +
        config.delta.x * a2 * Math.sin(fi) +
        config.delta.z * b2 * Math.sin(fi + PI12),
    };
    // Y offset
    const YOffset = a2 + config.pos.y + (config.delta.y * config.height) / 2;
    // Top box corners
    const A: PositionVector = {
      x: F.x - a2 * Math.cos(fi + PI34),
      y: YOffset,
      z: F.z - b2 * Math.sin(fi + PI34),
    };
    const B: PositionVector = {
      x: F.x + a2 * Math.cos(fi + PI14),
      y: YOffset,
      z: F.z - b2 * Math.sin(fi + PI14),
    };
    const C: PositionVector = {
      x: F.x + a2 * Math.cos(fi - PI14),
      y: YOffset,
      z: F.z + b2 * Math.sin(fi - PI14),
    };
    const D: PositionVector = {
      x: F.x - a2 * Math.cos(fi - PI34),
      y: YOffset,
      z: F.z + b2 * Math.sin(fi - PI34),
    };
    const output: BoundingBox = {
      depth: config.depth,
      height: config.height,
      width: config.width,
      position: {
        x: config.pos.x,
        y: YOffset,
        z: config.pos.z,
      },
      coordinateDelta: config.delta,
      corners: {
        top: {
          back: {
            left: A,
            right: D,
          },
          front: {
            left: B,
            right: C,
          },
        },
        bottom: {
          back: {
            left: A,
            right: D,
          },
          front: {
            left: B,
            right: C,
          },
        },
      },
    };
    output.corners.bottom.front.left.y = -YOffset;
    output.corners.bottom.front.right.y = -YOffset;
    output.corners.bottom.back.left.y = -YOffset;
    output.corners.bottom.back.right.y = -YOffset;
    return output;
  }
}
