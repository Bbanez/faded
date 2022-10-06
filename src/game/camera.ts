import { FunctionBuilder, Renderer, Ticker } from 'svemir';
import { PerspectiveCamera } from 'three';
import type { Camera, CameraConfig } from './types';

export async function createCamera(config: CameraConfig): Promise<Camera> {
  const camOffset = {
    x: -15,
    z: 20,
    y: 30,
  };
  const camera = new PerspectiveCamera();
  camera.position.set(
    camOffset.x + config.player.obj.position.x,
    camOffset.y,
    camOffset.z + config.player.obj.position.z,
  );
  camera.lookAt(config.player.obj.position.x, 0, config.player.obj.position.z);
  Renderer.setCamera(camera);

  const camFn = FunctionBuilder.linear2D([
    [0, 0],
    [1, 0.05],
  ]);

  const tickUnsub = Ticker.subscribe(() => {
    const accX = camFn(
      config.player.obj.position.x - camera.position.x + camOffset.x,
    );
    const accY = camFn(
      config.player.obj.position.y - camera.position.y + camOffset.y,
    );
    const accZ = camFn(
      config.player.obj.position.z - camera.position.z + camOffset.z,
    );
    if (accX) {
      camera.position.x = camera.position.x + accX;
    }
    if (accY) {
      camera.position.y = camera.position.y + accY;
    }
    if (accZ) {
      camera.position.z = camera.position.z + accZ;
    }
    camera.lookAt(
      config.player.obj.position.x,
      config.player.obj.position.y,
      config.player.obj.position.z,
    );
  });

  return {
    cam: camera,
    async destroy() {
      tickUnsub();
    },
  };
}
