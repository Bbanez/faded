import { FunctionBuilder, Logger, MathUtil, Point2D, Scene } from 'svemir';
import {  BoxGeometry, Mesh, MeshStandardMaterial } from 'three';
import { Obstacle, ObstacleIntersections } from './obstacle';

export class PathFinder {
  public static obstacles: Obstacle[] = [];

  static resolve(origin: Point2D, target: Point2D): Point2D[] {
    const p: Point2D[] = [origin, target];
    let pFn = FunctionBuilder.linear2D([
      [origin.x, origin.z],
      [target.x, target.z],
    ]);
    let n = 0;
    let loop = true;
    interface MatchingQ {
      q: Obstacle;
      intersections: ObstacleIntersections;
    }
    let loopCount = 0;
    while (loop) {
      const areaX = [0, 0];
      const areaZ = [0, 0];
      if (p[n].x < p[n + 1].x) {
        areaX[0] = p[n].x;
        areaX[1] = p[n + 1].x;
      } else {
        areaX[0] = p[n + 1].x;
        areaX[1] = p[n].x;
      }
      if (p[n].z < p[n + 1].z) {
        areaZ[0] = p[n].z;
        areaZ[1] = p[n + 1].z;
      } else {
        areaZ[0] = p[n + 1].z;
        areaZ[1] = p[n].z;
      }
      const matchingQs: MatchingQ[] = [];
      for (let i = 0; i < this.obstacles.length; i++) {
        const o = this.obstacles[i];
        const inters = o.getIntersections(p[n], pFn);
        let add = false;
        for (let k = 0; k < inters.length; k++) {
          const inter = inters[k];
          if (inter) {
            if (
              (inter.x >= areaX[0] &&
                inter.x <= areaX[1] &&
                inter.z >= areaZ[0] &&
                inter.z <= areaZ[1]) ||
              (o.q.x >= areaX[0] &&
                o.q.x <= areaX[1] &&
                o.q.z >= areaZ[0] &&
                o.q.z <= areaZ[1])
            ) {
              add = true;
              break;
            }
          }
        }
        if (add) {
          matchingQs.push({
            q: o,
            intersections: inters,
          });
        }
      }
      if (matchingQs.length > 0) {
        let minDist = 10000000000;
        let bestMatchIdx = -1;
        for (let i = 0; i < matchingQs.length; i++) {
          const matchingQ = matchingQs[i];
          const dist = p[n].distanceFrom(
            matchingQ.intersections[0]
              ? matchingQ.intersections[0]
              : (matchingQ.intersections[1] as Point2D),
          );
          if (
            dist < minDist &&
            matchingQ.intersections[0] &&
            !matchingQ.intersections[0].isEqual(p[n])
          ) {
            if (!p[n - 2] || !p[n - 2].isEqual(p[n])) {
              minDist = dist;
              bestMatchIdx = i;
            }
          }
        }
        if (bestMatchIdx === -1) {
          loop = false;
        } else {
          const q = matchingQs[bestMatchIdx];
          for (let k = 0; k < q.intersections.length; k++) {
            const inter = q.intersections[k];
            if (inter) {
              const cb = new Mesh(
                new BoxGeometry(0.1, 26, 0.1),
                new MeshStandardMaterial({
                  color: k === 0 ? 0x1100ff : 0x00ffff,
                }),
              );
              cb.position.set(inter.x, 0, inter.z);
              Scene.scene.add(cb);
              setTimeout(() => {
                Scene.scene.remove(cb);
              }, 2000);
            }
          }
          let corner: Point2D;
          if (q.intersections[0]) {
            corner = q.q.getClosestCorner(q.intersections[0]);
            if (PathFinder.isPointInsideObstacle(corner)) {
              for (let k = 0; k < q.q.corners.length; k++) {
                const c = q.q.corners[k];
                if (c.isEqual(corner)) {
                  if (
                    MathUtil.isEqual(c.x, q.intersections[0].x) ||
                    MathUtil.isEqual(c.z, q.intersections[0].z)
                  ) {
                    corner = c;
                  }
                }
              }
            }
          } else if (q.intersections[1]) {
            corner = q.q.getClosestCorner(q.intersections[1]) as Point2D;
            if (PathFinder.isPointInsideObstacle(corner)) {
              for (let k = 0; k < q.q.corners.length; k++) {
                const c = q.q.corners[k];
                if (c.isEqual(corner)) {
                  if (
                    MathUtil.isEqual(c.x, q.intersections[1].x) ||
                    MathUtil.isEqual(c.z, q.intersections[1].z)
                  ) {
                    corner = c;
                  }
                }
              }
            }
          } else {
            loop = false;
            break;
          }
          if (corner.isEqual(p[n])) {
            loop = false;
            break;
          }
          p.splice(n + 1, 0, corner);
          n++;
          pFn = FunctionBuilder.linear2D([
            [p[n].x, p[n].z],
            [target.x, target.z],
          ]);
        }
      } else {
        loop = false;
      }
      loopCount++;
      if (loopCount > 1000) {
        Logger.log(p);
        throw Error('Loop count limit');
      }
    }
    return p.slice(1);
  }

  static findObstacleAtPosition(point: Point2D): Obstacle | null {
    for (let i = 0; i < this.obstacles.length; i++) {
      const obstacle = this.obstacles[i];
      if (obstacle.q.isEqual(point)) {
        return obstacle;
      }
    }
    return null;
  }

  static isPointInsideObstacle(point: Point2D): Obstacle | null {
    for (let i = 0; i < this.obstacles.length; i++) {
      const obstacle = this.obstacles[i];
      if (
        point.x > obstacle.corners[1].x &&
        point.x < obstacle.corners[0].x &&
        point.z > obstacle.corners[0].z &&
        point.z < obstacle.corners[3].z
      ) {
        return obstacle;
      }
    }
    return null;
  }
}
