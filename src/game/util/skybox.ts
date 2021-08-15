import type { Scene } from 'three';
import { Loader } from './loader';

export async function createSkybox({
  mapIndex,
  scene,
}: {
  mapIndex: number;
  scene: Scene;
}): Promise<void> {
  scene.background = await Loader.cubeTexture([
    `/assets/map/${mapIndex}/skybox/xn.png`,
    `/assets/map/${mapIndex}/skybox/xp.png`,
    `/assets/map/${mapIndex}/skybox/yp.png`,
    `/assets/map/${mapIndex}/skybox/yn.png`,
    `/assets/map/${mapIndex}/skybox/zp.png`,
    `/assets/map/${mapIndex}/skybox/zn.png`,
  ]);
}
