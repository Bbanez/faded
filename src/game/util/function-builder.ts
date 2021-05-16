import type { FunctionBuilderPrototype } from '../types';

function functionBuilder(): FunctionBuilderPrototype {
  return {
    linear: {
      d3d(_points) {
        // TODO
        return () => {
          // TODO
          return 0;
        };
      },
      d2d(points) {
        const k: number[] = [];
        const n: number[] = [];

        for (let i = 1; i < points.length; i++) {
          k.push(
            (points[i].y - points[i - 1].y) / (points[i].x - points[i - 1].x)
          );
          n.push(points[i - 1].y - k[i - 1] * points[i - 1].x);
        }

        return (x) => {
          let bestSectionIndex = 0;

          for (let i = 0; i < points.length - 1; i++) {
            if (x >= points[i].x && x <= points[i + 1].x) {
              bestSectionIndex = i;
              break;
            }
          }

          return k[bestSectionIndex] * x + n[bestSectionIndex];
        };
      },
    },
  };
}
export const FunctionBuilder = functionBuilder();
