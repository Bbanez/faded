export class MathUtil {
  static isEqual(a: number, b: number, tolerance?: number): boolean {
    if (tolerance) {
      return b > a - tolerance && b < a + tolerance;
    } else {
      return a === b;
    }
  }

  static radToDeg(rad: number): number {
    return (180 / rad) * Math.PI;
  }

  static degToRad(deg: number): number {
    return (Math.PI / deg) * 180;
  }
}
