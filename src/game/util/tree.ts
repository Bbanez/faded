import { PointLight, Scene } from 'three';
import type { HeightMap, Point3D } from '../types';
import { DensityMap } from './density-map';
import { DistanceUtil } from './distance';
import { FunctionBuilder } from './function-builder';
import { Loader } from './loader';

export async function createTrees({
  mapIndex,
  scene,
  heightMap,
}: {
  mapIndex: number;
  scene: Scene;
  heightMap: HeightMap;
}): Promise<void> {
  const treeMap = await Loader.texture(
    `/assets/map/${mapIndex}/masks/tree.png`
  );
  const dMap = DensityMap.getPixelArray(treeMap, 'r');

  const _tree = await Loader.gltf(`/assets/map/${mapIndex}/trees/0.gltf`);
  const _treeSmall = await Loader.gltf(`/assets/map/${mapIndex}/trees/1.gltf`);
  const _treeBush = await Loader.gltf(`/assets/map/${mapIndex}/trees/2.gltf`);
  _tree.scene.traverse((c) => {
    c.castShadow = true;
  });
  _treeSmall.scene.traverse((c) => {
    c.castShadow = true;
  });
  const treeAngleFn = FunctionBuilder.linear.d2d([
    {
      x: 0,
      y: -Math.PI,
    },
    {
      x: 1,
      y: Math.PI,
    },
  ]);
  const xs = Object.keys(dMap).map((e) => parseInt(e));
  for (let i = 0; i < xs.length; i++) {
    const x = xs[i];
    const zs = Object.keys(dMap[x]).map((e) => parseInt(e));
    for (let j = 0; j < zs.length; j++) {
      const z = zs[j];
      if (dMap[x][z] > 253) {
        const y = heightMap.get(x, z);
        const tree = _tree.scene.clone();
        const offset: Point3D = {
          x: Math.random() * 2,
          y: Math.random() * 2,
          z: Math.random() + 2,
        };
        tree.scale.setScalar(offset.z);
        tree.position.set(x, y, z);
        tree.rotation.y = treeAngleFn(Math.random());
        scene.add(tree);
        const pointLight = new PointLight(0x00ffff, 0.5, 20);
        pointLight.position.set(tree.position.x, 10, tree.position.z);
        scene.add(pointLight);
      } else if (dMap[x][z] > 140 && dMap[x][z] < 160) {
        const y = DistanceUtil.ground.height({ x, y: z });
        const tree = _treeSmall.scene.clone();
        const offset: Point3D = {
          x: Math.random() * 2,
          y: Math.random() * 2,
          z: Math.random() + 0.5,
        };
        tree.scale.setScalar(offset.z);
        tree.position.set(x, y, z);
        tree.rotation.y = treeAngleFn(Math.random());
        scene.add(tree);
      } else if (dMap[x][z] > 0) {
        const y = DistanceUtil.ground.height({ x, y: z });
        const tree = _treeBush.scene.clone();
        const offset: Point3D = {
          x: Math.random(),
          y: Math.random(),
          z: Math.random() + 0.2,
        };
        tree.scale.setScalar(offset.z);
        tree.position.set(x + offset.x, y, z + offset.y);
        tree.rotation.y = treeAngleFn(Math.random());
        scene.add(tree);
      }
    }
  }
}
