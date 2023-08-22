import { linear, Linear, Obstacle, Point2D } from './math';

export class Nogo {
  obstacles: Array<Array<Obstacle | null>> = [];
  xTrans: Linear;
  xStep: number;
  zTrans: Linear;
  zStep: number;

  constructor(public nogoMap: number[][], public mapSize: Point2D) {
    const pInfo = nogoMap;
    this.xTrans = linear([
      [0, 0],
      [mapSize.x, pInfo[0].length],
    ]);
    this.xStep = this.xTrans.inverse(1);
    this.zTrans = linear([
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
        } else {
          this.obstacles[z].push(null);
        }
      }
    }
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
    const pFn = linear([
      [p[0].x, p[0].z],
      [p[1].x, p[1].z],
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
          const inter = obs.doesIntersects(pFn);
          if (inter) {
            return obs;
          }
        }
      }
    }
    return null;
  }

  aStar(origin: Point2D, target: Point2D): Point2D[] {
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
          current[2] + neighborW[2],
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
              nextNodeIdx[2],
              nextNodeIdx[2] +
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
        if (!isInSet(openSet, neighbor[0], neighbor[1])) {
          openSet.push(neighbor);
        }
      }
    }
    let loop = true;
    let nextNode = closedSet[closedSet.length - 1];
    cameFrom.push(nextNode);
    while (loop) {
      if ((nextNode[0] === p[0].x && nextNode[1] === p[0].z) || !nextNode[4]) {
        loop = false;
      } else {
        nextNode = nextNode[4];
        cameFrom.push(nextNode);
      }
    }
    const points = cameFrom.slice(1, cameFrom.length - 2).map((node) => {
      return new Point2D(
        this.xTrans.inverse(node[0]),
        this.zTrans.inverse(node[1]),
      );
    });
    return [target, ...points];
  }
}
