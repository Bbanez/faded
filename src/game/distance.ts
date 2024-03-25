import { Object3D, Raycaster, Vector3 } from 'three';
import { Point } from '../types/rs';

export class Distance {
    static ray = new Raycaster();
    static rayDir = new Vector3(0, -1, 0);

    static heightTo(point: Point, object: Object3D): number {
        if (object) {
            this.ray.set(new Vector3(point.x, 100, point.y), this.rayDir);
            const intersect = this.ray.intersectObject(object, true);
            if (intersect[0]) {
                return intersect[0].point.y;
            }
            console.warn(
                Error(
                    'No intersection at position' +
                        ` x=${point.x}, z=${point.y} with the ${object.name}.`,
                ),
            );
        }
        return 0;
    }
}
