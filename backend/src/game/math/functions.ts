export interface Linear {
  (x: number): number;
  inverse(z: number): number;
}

export function linear(points: [[number, number], [number, number]]): Linear {
  const k = (points[1][1] - points[0][1]) / (points[1][0] - points[0][0]);
  const n = points[0][1] - k * points[0][0];
  const fn = (x: number) => {
    return k * x + n;
  };
  fn.inverse = (z: number) => {
    return (z - n) / k;
  };
  return fn;
}