import { FunctionBuilder, PI12, Point2D, Scene } from 'svemir';
import { Linear2DFn } from 'svemir/types';
import { Mesh, MeshBasicMaterial, PlaneGeometry, Texture } from 'three';
import { Obstacle } from './obstacle';
import { getPixelMatrixFromTexture } from './util';

export class Nogo {
  obstacles: Array<Array<Obstacle | null>> = [];
  xTrans: Linear2DFn;
  xStep: number;
  zTrans: Linear2DFn;
  zStep: number;

  constructor(public nogoMap: Texture, public mapSize: Point2D) {
    const pInfo = getPixelMatrixFromTexture(nogoMap, 0);
    this.xTrans = FunctionBuilder.linear2D([
      [0, 0],
      [mapSize.x, pInfo[0].length],
    ]);
    this.xStep = this.xTrans.inverse(1);
    this.zTrans = FunctionBuilder.linear2D([
      [0, 0],
      [mapSize.z, pInfo.length],
    ]);
    this.zStep = this.zTrans.inverse(1);
    for (let z = 0; z < pInfo.length; z++) {
      this.obstacles.push([]);
      for (let x = 0; x < pInfo[z].length; x++) {
        const value = pInfo[z][x];
        if (value > 150) {
          this.obstacles[z].push(
            new Obstacle(
              new Point2D(this.xTrans.inverse(x), this.zTrans.inverse(z)),
              this.xStep,
              this.zStep,
              0,
              0,
            ),
          );
          // this.cPlane(
          //   0,
          //   this.xTrans.inverse(x),
          //   this.zTrans.inverse(z),
          //   this.xStep,
          // );
        } else {
          this.obstacles[z].push(null);
        }
      }
    }
  }

  cPlane(color: number, x: number, z: number, size: number) {
    const plane = new Mesh(
      new PlaneGeometry(size, size),
      new MeshBasicMaterial({ color }),
    );
    plane.rotation.x = -PI12;
    plane.position.set(x, 0.5, z);
    Scene.scene.add(plane);
  }

  closestValidNode(point: Point2D): Point2D {
    const validNode = [
      parseInt('' + this.xTrans(point.x)),
      parseInt('' + this.zTrans(point.z)),
    ];
    if (
      this.obstacles[validNode[1]] &&
      this.obstacles[validNode[1]][validNode[0]]
    ) {
      const neighborsW = [
        [0, -1],
        [1, -1],
        [1, 0],
        [1, 1],
        [0, 1],
        [-1, 1],
        [-1, 0],
        [-1, -1],
      ];
      let loop = true;
      let count = 1;
      while (loop) {
        const indexes = neighborsW.map((e) => [
          validNode[0] + count * e[0],
          validNode[1] + count * e[1],
        ]);
        for (let i = 0; i < indexes.length; i++) {
          const idx = indexes[i];
          if (!this.obstacles[idx[1]] || !this.obstacles[idx[1]][idx[0]]) {
            loop = false;
            return new Point2D(
              this.xTrans.inverse(idx[0]),
              this.zTrans.inverse(idx[1]),
            );
          }
        }
        count++;
      }
    }
    return point;
  }

  intersectsObstacle(origin: Point2D, target: Point2D): Obstacle | null {
    const p: Point2D[] = [origin, target];
    const pFn = FunctionBuilder.linear2D([
      [origin.x, origin.z],
      [target.x, target.z],
    ]);
    let fromX = p[0].x;
    let toX = p[1].x;
    let fromZ = p[0].z;
    let toZ = p[1].z;
    if (p[0].x > p[1].x) {
      fromX = p[1].x;
      toX = p[0].x;
    }
    if (p[0].z > p[1].z) {
      fromZ = p[1].z;
      toZ = p[0].z;
    }
    for (let z = fromZ; z <= toZ; z++) {
      for (let x = fromX; x <= toX; x++) {
        if (this.obstacles[z] && this.obstacles[z][x]) {
          const obs = this.obstacles[z][x] as Obstacle;
          const inter = obs.getIntersections(p[0], pFn);
          if (inter.length > 0) {
            return obs;
          }
        }
      }
    }
    return null;
  }

  aStar(origin: Point2D, target: Point2D): Point2D[] {
    // async function delay(t: number) {
    //   await new Promise<void>((resolve) => {
    //     setTimeout(() => {
    //       resolve();
    //     }, t);
    //   });
    // }

    const p: Point2D[] = [
      new Point2D(
        parseInt('' + this.xTrans(origin.x)),
        parseInt('' + this.zTrans(origin.z)),
      ),
      new Point2D(
        parseInt('' + this.xTrans(target.x)),
        parseInt('' + this.zTrans(target.z)),
      ),
    ];
    if (!this.intersectsObstacle(p[0], p[1])) {
      return [target];
    }
    // this.cPlane(
    //   0x00ff00,
    //   this.xTrans.inverse(p[0].x),
    //   this.zTrans.inverse(p[0].z),
    //   this.xStep,
    // );
    // this.cPlane(
    //   0x0000ff,
    //   this.xTrans.inverse(p[1].x),
    //   this.zTrans.inverse(p[1].z),
    //   this.xStep,
    // );
    type Node = [
      // X
      number,
      // Z
      number,
      // G
      number,
      // F
      number,
      // Parent
      Node | null,
    ];
    const openSet: Node[] = [
      [
        parseInt('' + p[0].x),
        parseInt('' + p[0].z),
        0,
        p[0].distanceFrom(p[1]),
        null,
      ],
    ];
    const closedSet: Node[] = [];
    const cameFrom: Node[] = [];
    const neighborsW = [
      [0, -1, 1],
      [1, -1, 1.4],
      [1, 0, 1],
      [1, 1, 1.4],
      [0, 1, 1],
      [-1, 1, 1.4],
      [-1, 0, 1],
      [-1, -1, 1.4],
    ];

    function lowestF(nodes: Node[]): Node {
      let lowestIdx = -1;
      let lowestFh = 10000000000000;
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (node[3] < lowestFh) {
          lowestFh = node[3];
          lowestIdx = i;
        }
      }
      return nodes.splice(lowestIdx, 1)[0];
    }

    function isInSet(nodes: Node[], x: number, z: number): boolean {
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (node[0] === x && node[1] === z) {
          return true;
        }
      }
      return false;
    }

    while (openSet.length > 0) {
      const current = lowestF(openSet);
      if (current[0] === p[1].x && current[1] === p[1].z) {
        break;
      }
      closedSet.push(current);
      const neighbors: Array<Node | null> = [];
      let lowestFh = 10000000;
      let neighborIdx = -1;
      for (let i = 0; i < neighborsW.length; i++) {
        const neighborW = neighborsW[i];
        const nextNodeIdx = [
          current[0] + neighborW[0],
          current[1] + neighborW[1],
        ];
        if (
          nextNodeIdx[0] > -1 &&
          nextNodeIdx[0] < this.obstacles[0].length &&
          nextNodeIdx[1] > -1 &&
          nextNodeIdx[1] < this.obstacles.length
        ) {
          const obstacle = this.obstacles[nextNodeIdx[1]][nextNodeIdx[0]];
          if (
            !obstacle &&
            !isInSet(closedSet, nextNodeIdx[0], nextNodeIdx[1])
          ) {
            const neighbor: Node = [
              nextNodeIdx[0],
              nextNodeIdx[1],
              current[2] + neighborW[2],
              current[2] +
                p[1].distanceFrom(new Point2D(nextNodeIdx[0], nextNodeIdx[1])),
              current,
            ];
            neighbors.push(neighbor);
            if (neighbor[3] < lowestFh) {
              lowestFh = neighbor[3];
              neighborIdx = neighbors.length - 1;
            }
            if (!isInSet(openSet, neighbor[0], neighbor[1])) {
              openSet.push(neighbor);
            }
          } else {
            neighbors.push(null);
          }
        }
      }
      if (neighbors[neighborIdx]) {
        const neighbor = neighbors[neighborIdx] as Node;
        neighbor[4] = current;
        // this.cPlane(
        //   0xff0000,
        //   this.xTrans.inverse(neighbor[0]),
        //   this.zTrans.inverse(neighbor[1]),
        //   this.xStep,
        // );
        if (!isInSet(openSet, neighbor[0], neighbor[1])) {
          // openSet.push(neighbor);
        }
      }
      // await delay(50);
    }
    let loop = true;
    let nextNode = closedSet[closedSet.length - 1];
    cameFrom.push(nextNode);
    while (loop) {
      // this.cPlane(
      //   0x00ff00,
      //   this.xTrans.inverse(nextNode[0]),
      //   this.zTrans.inverse(nextNode[1]),
      //   this.xStep,
      // );
      if ((nextNode[0] === p[0].x && nextNode[1] === p[0].z) || !nextNode[4]) {
        loop = false;
      } else {
        nextNode = nextNode[4];
        cameFrom.push(nextNode);
      }
    }
    return [
      target,
      ...cameFrom.slice(1, cameFrom.length - 2).map((node) => {
        return new Point2D(
          this.xTrans.inverse(node[0]),
          this.zTrans.inverse(node[1]),
        );
      }),
    ];

    return p.slice(1).map((e) => {
      e.set(this.xTrans.inverse(e.x), this.zTrans.inverse(e.z));
      return e;
    });
  }
}
