import type { DistanceUtilPrototype } from '../types';
import { Group, Raycaster, Vector3 } from 'three';

function distanceUtil(): DistanceUtilPrototype {
  let ray: Raycaster;
  const rayDir = new Vector3(0, -1, 0);
  let ground: Group;

  return {
    ground: {
      setGeometry(groundGeometry) {
        ground = groundGeometry;
        ray = new Raycaster();
      },
      height(point) {
        if (!ground) {
          console.warn('Ground geometry is not defined.');
          return 0;
        }
        ray.set(new Vector3(point.x, 100, point.y), rayDir);
        const intersect = ray.intersectObject(ground, true);
        if (intersect[0]) {
          return intersect[0].point.y;
        }
        console.warn(
          'No intersection at position' +
            ` x=${point.x}, y=${point.y} with the ground.`
        );
        return 0;
      },
    },
    heightTo(point, group) {
      ray.set(new Vector3(point.x, 100, point.y), rayDir);
      const intersect = ray.intersectObject(group, true);
      if (intersect[0]) {
        return intersect[0].point.y;
      }
      console.warn(
        'No intersection at position' +
          ` x=${point.x}, y=${point.y} with the ground.`
      );
      return 0;
    },
  };
}
export const DistanceUtil = distanceUtil();
