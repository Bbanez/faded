import type { Scene } from 'three';
import { createEntity } from '../components';
import type { Entity } from '../types';

export async function createCharacter(scene: Scene): Promise<Entity> {
  const character = await createEntity({
    model: {
      fbx: {
        main: '/assets/character/female/character.fbx',
        animations: {
          backward: '/assets/character/female/backward.fbx',
          idle: '/assets/character/female/idle.fbx',
          left: '/assets/character/female/left.fbx',
          right: '/assets/character/female/right.fbx',
          slowRun: '/assets/character/female/slow-run.fbx',
        },
        onMainLoad(object) {
          object.traverse((c) => {
            c.castShadow = true;
          });
          object.scale.setScalar(0.009);
        },
      },
    },
    dimensions: {
      width: 0.4,
      depth: 0.4,
      height: 1.6,
    },
    coordinateDelta: { x: 0, y: 0.7, z: 0 },
  });
  character.update();
  character.addToScene(scene);
  character.playAnimation('idle');

  return character;
}
