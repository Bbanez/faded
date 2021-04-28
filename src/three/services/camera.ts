import type { Camera } from 'three';
import type { CameraFollowConfig, CameraServicePrototype } from '../types';
import { InputServiceSubscriptionType } from '../types';

export function CameraService({ camera }: { camera: Camera }) {
  let follow: CameraFollowConfig | null = null;

  window.t.engine.ticker.register(() => {
    if (follow) {
      camera.position.set(
        follow.object.position.x + 20,
        follow.object.position.y + 20,
        follow.object.position.z + 20
      );
      camera.lookAt(follow.object.position);
    }
  });

  const self: CameraServicePrototype = {
    follow(config) {
      follow = config;
    },
    // update() {
    //   renderer.render(scene, camera);
    // },
  };
  return self;
}
