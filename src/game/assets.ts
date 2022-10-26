import { Loader } from 'svemir';
import type { CubeTexture, Texture } from 'three';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

interface Assets {
  map: GLTF;
  skybox: CubeTexture;
  masksNogo: Texture;
}

export const Assets: Assets = {} as never;

export async function loadAssets(): Promise<void> {
  Loader.register([
    {
      path: [
        '/assets/skybox/xn.png',
        '/assets/skybox/xp.png',
        '/assets/skybox/yp.png',
        '/assets/skybox/yn.png',
        '/assets/skybox/zp.png',
        '/assets/skybox/zn.png',
      ],
      name: 'skybox',
      type: 'cubeTexture',
    },
    {
      path: '/assets/maps/0/map.gltf',
      name: 'map',
      type: 'gltf',
    },
    {
      path: '/assets/maps/0/masks/nogo.png',
      name: 'masksNogo',
      type: 'texture',
    },
  ]);

  const unsub = Loader.onLoaded((item, data) => {
    const key = item.name as keyof Assets;
    Assets[key] = data as never;
  });
  await Loader.run();
  unsub();
}
