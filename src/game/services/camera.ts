import type { Camera } from 'three';
import { Vector3 } from 'three';
import type {
  CameraFollowConfig,
  CameraServicePrototype,
  InputServicePrototype,
} from '../types';
import { InputServiceSubscriptionType } from '../types';

export function createCameraService({
  camera,
  input,
}: {
  camera: Camera;
  input: InputServicePrototype;
}): CameraServicePrototype {
  let currentNormalOffset = 15;
  let follow: CameraFollowConfig | null = null;
  let zoomLatch = false;
  let zoomFrom = 0;
  const dump = 10;

  function calcPosition(): Vector3 {
    if (follow) {
      const offset = {
        x:
          (-camera.position.x +
            currentNormalOffset +
            follow.entity.object.position.x) /
          dump,
        y:
          (-camera.position.y +
            currentNormalOffset +
            follow.entity.object.position.y) /
          dump,
        z:
          (-camera.position.z +
            currentNormalOffset +
            follow.entity.object.position.z) /
          dump,
      };
      return new Vector3(
        camera.position.x + offset.x,
        camera.position.y + offset.y,
        camera.position.z + offset.z
      );
    }
    return camera.position;
  }

  input.subscribe(InputServiceSubscriptionType.MOUSE_MOVE, (_type, st) => {
    if (st.mouse.click.middle && follow) {
      if (!zoomLatch) {
        zoomLatch = true;
        zoomFrom = st.mouse.y;
      }
      currentNormalOffset = currentNormalOffset + (zoomFrom - st.mouse.y) / 100;
      if (currentNormalOffset > follow.far) {
        currentNormalOffset = follow.far;
        zoomFrom = st.mouse.y;
      } else if (currentNormalOffset < follow.near) {
        currentNormalOffset = follow.near;
        zoomFrom = st.mouse.y;
      }
    } else {
      zoomLatch = false;
    }
  });

  const self: CameraServicePrototype = {
    follow(config) {
      follow = config;
      follow.far = (window.innerHeight * follow.far) / 672;
      follow.near = (window.innerHeight * follow.near) / 672;
      currentNormalOffset = (follow.far - follow.near) / 2;
      self.update();
    },
    update() {
      if (follow) {
        camera.position.copy(calcPosition());
        const lookAt = follow.entity.getPosition();
        camera.lookAt(lookAt.x, lookAt.y + 1, lookAt.z);
      }
    },
  };
  return self;
}
