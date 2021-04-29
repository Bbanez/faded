import type { Camera } from 'three';
import { Vector3 } from 'three';
import type {
  CameraFollowConfig,
  CameraServicePrototype,
  InputServicePrototype,
} from '../types';
import { InputServiceSubscriptionType } from '../types';

export function CameraService({
  camera,
  inputService,
}: {
  camera: Camera;
  inputService: InputServicePrototype;
}): CameraServicePrototype {
  const normalOffset = 100;
  let currentNormalOffset = 100;
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
            follow.object.position.x) /
          dump,
        y: (-camera.position.y + currentNormalOffset) / dump,
        z:
          (-camera.position.z +
            currentNormalOffset +
            follow.object.position.z) /
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

  inputService.subscribe(
    InputServiceSubscriptionType.MOUSE_MOVE,
    (_type, st) => {
      if (st.mouse.click.middle) {
        if (!zoomLatch) {
          zoomLatch = true;
          zoomFrom = st.mouse.y;
        }
        currentNormalOffset =
          currentNormalOffset + (zoomFrom - st.mouse.y) / 16;
        if (currentNormalOffset > normalOffset) {
          currentNormalOffset = normalOffset;
          zoomFrom = st.mouse.y;
        } else if (currentNormalOffset < 30) {
          currentNormalOffset = 30;
          zoomFrom = st.mouse.y;
        }
      } else {
        zoomLatch = false;
      }
    }
  );

  const self: CameraServicePrototype = {
    follow(config) {
      follow = config;
    },
    update() {
      if (follow) {
        camera.position.copy(calcPosition());
        camera.lookAt(follow.object.position);
      }
    },
  };
  return self;
}
