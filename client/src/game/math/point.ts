import { Vector2D } from './vector';

export class Point2D {
  constructor(public x: number, public z: number) {}

  public distanceFrom(point: Point2D): number {
    const x = this.x - point.x;
    const z = this.z - point.z;
    return Math.sqrt(x * x + z * z);
  }
  public distanceToVector(point: Point2D): Vector2D {
    const x = this.x - point.x;
    const z = this.z - point.z;
    const strength = Math.sqrt(x * x + z * z);
    const angle = Math.acos(strength / x);

    return new Vector2D({ position: point, strength, angle });
  }
  public setX(x: number): void {
    this.x = x;
  }
  public setZ(z: number): void {
    this.z = z;
  }
  public set(x: number, z: number): void {
    this.x = x;
    this.z = z;
  }

  public isEqual(point: Point2D, tolerance?: number): boolean {
    if (!tolerance) {
      tolerance = 0.01;
    }
    if (tolerance) {
      return (
        point.x > this.x - tolerance &&
        point.x < this.x + tolerance &&
        point.z > this.z - tolerance &&
        point.z < this.z + tolerance
      );
    }
    return this.x === point.x && this.z === point.z;
  }
}
