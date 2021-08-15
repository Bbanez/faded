import { Camera, Color, Scene, Vector3 } from 'three';
import type { HeightMap, ParticleSystemPrototype, Point2D } from '../types';
import { DensityMap } from './density-map';
import { FunctionBuilder } from './function-builder';
import { Loader } from './loader';
import { createParticleSystem } from './particle-system';

export async function createGrass({
  mapIndex,
  camera,
  scene,
  heightMap,
}: {
  mapIndex: number;
  camera: Camera;
  scene: Scene;
  heightMap: HeightMap;
}): Promise<{ system: ParticleSystemPrototype }> {
  const texture = await Loader.texture(`/assets/map/${mapIndex}/grass2.png`);
  const grassMap = await Loader.texture(
    `/assets/map/${mapIndex}/masks/grass.png`
  );
  const dMap = DensityMap.getPixelArray(grassMap, 'g');

  const system = createParticleSystem({
    texture,
  });
  system.useCamera(camera);
  system.addTo(scene);

  const grassCountFn = FunctionBuilder.linear.d2d([
    {
      x: 0,
      y: 0,
    },
    {
      x: 100,
      y: 1,
    },
    {
      x: 200,
      y: 4,
    },
    {
      x: 255,
      y: 8,
    },
  ]);
  const xs = Object.keys(dMap).map((e) => parseInt(e));
  for (let i = 0; i < xs.length; i++) {
    const x = xs[i];
    const zs = Object.keys(dMap[x]).map((e) => parseInt(e));
    for (let j = 0; j < zs.length; j++) {
      const z = zs[j];
      const grassCount = grassCountFn(dMap[x][z]);
      if (grassCount > 0) {
        const y = heightMap.get(x, z);
        for (let k = 0; k < grassCount; k++) {
          const offset: Point2D = {
            x: Math.random() * 2,
            y: Math.random() * 2,
          };
          system.addParticle({
            position: new Vector3(x + offset.x, y, z + offset.y),
            angle: {
              x: 0,
              y: 0,
            },
            size: 1,
            color: {
              value: new Color(1, 1, 1),
              alpha: 1,
            },
          });
        }
      }
    }
  }
  system.updateParticles();
  system.updateGeometry();

  return { system };
}
