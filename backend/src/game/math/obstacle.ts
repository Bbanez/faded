import type { Linear } from './functions';
import { Point2D } from './point';

export type ObstacleIntersections = [Point2D | null, Point2D | null];

export class Obstacle {
  corners: Point2D[] = [];

  constructor(
    /**
     * Coordinates of the top left corner.
     */
    public q: Point2D,
    /**
     * Size in x direction.
     */
    public qa: number,
    /**
     * Size in z direction.
     */
    public qb: number,
    /**
     * x offset
     */
    public lx: number,
    /**
     * z offset
     */
    public lz: number,
  ) {
    /*
     *  Corners in array
     *  1 --- 0
     *  |     |
     *  2 --- 3
     */
    for (let m = 0; m < 4; m++) {
      let g: number;
      let u: number;
      let h: number;
      let v: number;
      if (m === 0 || m === 3) {
        g = 1;
        u = 1;
      } else {
        g = 0;
        u = -1;
      }
      if (m === 0 || m === 1) {
        h = 0;
        v = -1;
      } else {
        h = 1;
        v = 1;
      }
      this.corners.push(
        new Point2D(
          this.q.x + g * this.qa + u * this.lx,
          this.q.z + h * this.qb + v * this.lz,
        ),
      );
    }
  }

  getIntersections(origin: Point2D, lineFn: Linear): ObstacleIntersections {
    let ax = -1;
    let az = -1;
    const ax1 = this.corners[0].x;
    const ax2 = this.corners[1].x;
    const az1 = lineFn(ax1);
    const az2 = lineFn(ax2);
    if (az1 >= this.corners[1].z && az1 <= this.corners[2].z) {
      ax = ax1;
      az = az1;
    } else if (az2 >= this.corners[1].z && az2 <= this.corners[2].z) {
      ax = ax2;
      az = az2;
    } else {
      const az3 = this.corners[0].z;
      const az4 = this.corners[3].z;
      const ax3 = lineFn.inverse(az3);
      const ax4 = lineFn.inverse(az4);
      if (ax3 >= this.corners[1].x && ax3 <= this.corners[0].x) {
        ax = ax3;
        az = az3;
      } else if (ax4 >= this.corners[1].x && ax4 <= this.corners[0].x) {
        ax = ax4;
        az = az4;
      } else {
        // ax = origin.x;
        // az = origin.z;
      }
    }
    // if (origin.x === ax && origin.z === az) {
    //   ax = origin.x;
    //   az = origin.z;
    // }
    let bx = -1;
    let bz = -1;
    const bz1 = this.corners[0].z;
    const bz2 = this.corners[3].z;
    const bx1 = lineFn.inverse(bz1);
    const bx2 = lineFn.inverse(bz2);
    if (
      bx1 >= this.corners[1].x &&
      bx1 <= this.corners[0].x &&
      bx1 !== ax &&
      bz1 !== az
    ) {
      bx = bx1;
      bz = bz1;
    } else if (
      bx2 >= this.corners[1].x &&
      bx2 <= this.corners[0].x &&
      bx2 !== ax &&
      bz2 !== az
    ) {
      bx = bx2;
      bz = bz2;
    } else {
      const bx3 = this.corners[0].x;
      const bx4 = this.corners[1].x;
      const bz3 = lineFn(bx3);
      const bz4 = lineFn(bx4);
      if (
        bz3 <= this.corners[3].z &&
        bz3 >= this.corners[0].z &&
        bx3 !== ax &&
        bz3 !== az
      ) {
        bx = bx3;
        bz = bz3;
      } else if (
        bz4 <= this.corners[3].z &&
        bz4 >= this.corners[0].z &&
        bx4 !== ax &&
        bz4 !== az
      ) {
        bx = bx4;
        bz = bz4;
      }
    }
    // if (origin.x === bx && origin.z === bz) {
    //   bx = -1;
    //   bz = -1;
    // }
    const A = ax !== -1 && az !== -1 ? new Point2D(ax, az) : null;
    const B = bx !== -1 && bz !== -1 ? new Point2D(bx, bz) : null;
    // for (let i = 0; i < this.corners.length; i++) {
    //   const c = this.corners[i];
    //   if (A && A.isEqual(c, 0.01)) {
    //     A = null;
    //   }
    //   if (B && B.isEqual(c, 0.01)) {
    //     B = null;
    //   }
    // }
    const aDist = A ? A.distanceFrom(origin) : 1000000000;
    const bDist = B ? B.distanceFrom(origin) : 1000000000;
    const output: ObstacleIntersections = aDist < bDist ? [A, B] : [B, A];

    if (output[0] && output[1] && output[0].isEqual(origin, 0.01)) {
      for (let i = 0; i < this.corners.length; i++) {
        const corner = this.corners[i];
        if (
          (output[1].x === corner.x && output[0].z === corner.z) ||
          (output[1].z === corner.z && output[0].x === corner.x)
        ) {
          return [corner, null];
        }
      }
    }

    // if (!A && B) {
    //   for (let i = 0; i < this.corners.length; i++) {
    //     const corner = this.corners[i];
    //     if (corner.isEqual(origin)) {
    //       const nextCorner = i === 3 ? this.corners[0] : this.corners[i + 1];
    //       const prevCorner = i === 0 ? this.corners[3] : this.corners[i - 1];
    //       const nDist = nextCorner.distanceFrom(B);
    //       const pDist = prevCorner.distanceFrom(B);
    //       return [nDist < pDist ? nextCorner : prevCorner, null];
    //     }
    //   }
    // }
    return output;
  }

  getClosestCorner(point: Point2D, next?: boolean): Point2D {
    const output = new Point2D(this.corners[0].x, this.corners[0].z);
    let minDist = point.distanceFrom(output);
    for (let i = 1; i < 4; i++) {
      const dist = point.distanceFrom(this.corners[i]);
      if (dist < minDist) {
        minDist = dist;
        if (next) {
          output.set(
            this.corners[i === 0 ? 3 : i - 1].x,
            this.corners[i === 0 ? 3 : i - 1].z,
          );
        } else {
          output.set(this.corners[i].x, this.corners[i].z);
        }
      }
    }
    return output;
  }

  doesIntersects(lineFn: Linear): boolean {
    let z = lineFn(this.corners[1].x);
    if (z >= this.corners[1].z && z <= this.corners[2].z) {
      return true;
    }
    z = lineFn(this.corners[0].x);
    if (z >= this.corners[1].z && z <= this.corners[2].z) {
      return true;
    }
    let x = lineFn.inverse(this.corners[0].z);
    if (x >= this.corners[1].x && x <= this.corners[0].x) {
      return true;
    }
    x = lineFn.inverse(this.corners[3].z);
    if (x >= this.corners[1].x && x <= this.corners[0].x) {
      return true;
    }
    return false;
  }
}
