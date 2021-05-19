import type { HeightMap, HeightMapConfig, MatrixXZ } from '../types';
import { ErrorEventType } from '../types';
import { DistanceUtil } from './distance';
import { ErrorManager } from './error';

export function createHeightMap(config: HeightMapConfig): HeightMap {
  let createMap = false;
  let map: MatrixXZ = {};

  {
    /**
     * TODO: This can be tempered with. See if it can cause issues.
     */
    const lsMap: MatrixXZ | null = config.storage.get(`hm_${config.id}`);
    if (!lsMap) {
      createMap = true;
      map = {};
    } else {
      map = lsMap;
    }
  }

  /**
   * Create height map points
   */
  if (createMap) {
    console.log(
      `Height map: ${config.x.end - config.x.start}, ${
        config.z.end - config.z.start
      }`
    );
    for (let x = config.x.start; x <= config.x.end; x += config.stepSize.x) {
      map[x] = {};
      for (let z = config.z.start; z <= config.z.end; z += config.stepSize.z) {
        map[x][z] = DistanceUtil.heightTo(
          {
            x,
            y: z,
          },
          config.group
        );
        z += config.stepSize.z;
        if (z > config.z.end) {
          z = config.z.start;
        }
      }
      x += config.stepSize.x;
      if (x > config.x.end) {
        x = config.x.start;
      }
    }
    config.storage.set(`hm_${config.id}`, map).catch((err) => {
      ErrorManager.trigger(ErrorEventType.ERROR, {
        jsError: err,
        message: `Failed to save HM for ${config.id}`,
        place: 'init',
        mainSource: 'HeightMap',
      });
    });
  }

  return {
    get(x, z) {
      if (map[x]) {
        if (map[x][z]) {
          return map[x][z];
        }
      }
      return 0;
    },
    getSize() {
      return {
        x: config.x.end - config.x.start,
        z: config.z.end - config.z.start,
      };
    },
    getStepSize() {
      return config.stepSize;
    },
    getLimits() {
      return {
        x: config.x,
        z: config.z,
      };
    },
  };
}
