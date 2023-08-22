export class MathUtil {
  static isEqual(a: number, b: number, tolerance?: number): boolean {
    if (tolerance) {
      return b > a - tolerance && b < a + tolerance;
    } else {
      return a === b;
    }
  }
}
