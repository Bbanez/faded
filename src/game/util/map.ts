import type { Scene } from 'three';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import type { ErrorHandlerPrototype } from '../types';
import { Loader } from './loader';

export async function createMap(
  error: ErrorHandlerPrototype,
  mapIndex: number,
  scene: Scene
): Promise<{
  terrainModel: GLTF;
}> {
  const maps = [`/assets/map/${mapIndex}/terrain.gltf`];
  if (!maps[mapIndex]) {
    throw error.break(
      'createMap',
      `Map with index "${mapIndex}"` + ' does not exist',
      'Available:',
      maps
    );
  }
  const terrainModel = await Loader.gltf(maps[mapIndex]);
  terrainModel.scene.scale.setScalar(200);
  terrainModel.scene.traverse((c) => {
    c.receiveShadow = true;
  });
  scene.add(terrainModel.scene);

  return {
    terrainModel,
  };
}
