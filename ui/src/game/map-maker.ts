import { Map } from '@backend/map';
import { MediaBaseUri } from '@ui/util/bcms';
import { createSvemir, Loader, Renderer, Scene, Spectator } from 'svemir';
import { Svemir } from 'svemir/types';
import {
  AmbientLight,
  AxesHelper,
  DirectionalLight,
  GridHelper,
  Group,
  PerspectiveCamera,
  Vector3,
} from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

export interface MapMakerConfig {
  target: HTMLElement;
  size: [number, number];
  map: Map;
}

export interface MapMaker {
  game: Svemir;
  destroy(): void;
  updateChunks(map: Map): void;
}

function getChunks(map: Map): Array<Array<{ type: string; g?: Group }>> {
  return map.data.level1.map((col, x) => {
    return col.rows.map((row, y) => {
      let g: Group | undefined = undefined;
      if (row.type === 'edge-corner') {
        g = models['mt-edge-corner'].scene.clone();
      } else if (row.type === 'edge') {
        g = models['mt-edge'].scene.clone();
      } else if (row.type === 'ground') {
        g = models['mt-ground'].scene.clone();
      }
      if (g) {
        g.position.set(1 + x * 2, 0, 1 + y * 2);
      }
      return {
        type: row.type,
        g,
      };
    });
  });
}

const models: {
  [name: string]: GLTF;
} = {};

export async function createMapMaker(config: MapMakerConfig) {
  Loader.register([
    {
      name: 'mt-edge',
      type: 'gltf',
      path: `${MediaBaseUri}/fdd/map-chunks/test/edge.gltf`,
    },
    {
      name: 'mt-edge-corner',
      type: 'gltf',
      path: `${MediaBaseUri}/fdd/map-chunks/test/edge-corner.gltf`,
    },
    {
      name: 'mt-ground',
      type: 'gltf',
      path: `${MediaBaseUri}/fdd/map-chunks/test/ground.gltf`,
    },
  ]);
  Loader.onLoaded((item, data) => {
    if (item.name.startsWith('mt-')) {
      const d = data as GLTF;
      d.scene.traverse((c) => {
        c.receiveShadow = true;
      });
      models[item.name] = d;
    }
  });
  await Loader.run();
  return await new Promise<MapMaker>((resolve) => {
    const game = createSvemir({
      element: config.target,
      frameTicker: true,
      renderer: {
        size: {
          width: config.target.offsetWidth,
          height: config.target.offsetHeight,
        },
      },
      async onReady() {
        resolve(maker);
      },
    });
    const axHelp = new AxesHelper(500);
    Scene.scene.add(axHelp);

    const camera = new PerspectiveCamera();
    camera.position.set(-10, 10, -10);
    camera.lookAt(new Vector3(0, 0, 0));
    const spectator = new Spectator(camera);
    Renderer.setCamera(camera);

    const gridHelper = new GridHelper(...config.size);
    Scene.scene.add(gridHelper);

    const ambientLight = new AmbientLight(0xffffff, 4);
    Scene.scene.add(ambientLight);

    const sun = new DirectionalLight(0xffffff);
    sun.position.set(50, 100, 0);
    sun.castShadow = true;
    sun.lookAt(0, 0, 0);
    sun.shadow.mapSize.width = 4096;
    sun.shadow.mapSize.height = 4096;
    sun.shadow.camera.left = 200;
    sun.shadow.camera.right = -200;
    sun.shadow.camera.top = 200;
    sun.shadow.camera.bottom = -200;
    Scene.scene.add(sun);

    let chunks = getChunks(config.map);
    for (let x = 0; x < chunks.length; x++) {
      const chunkRow = chunks[x];
      for (let z = 0; z < chunkRow.length; z++) {
        const c = chunkRow[z];
        if (c.g) {
          Scene.scene.add(c.g);
        }
      }
    }

    const maker: MapMaker = {
      game,

      destroy() {
        game.destroy();
        spectator.destroy();
      },

      updateChunks(map) {
        for (let x = 0; x < chunks.length; x++) {
          const chunkRow = chunks[x];
          for (let z = 0; z < chunkRow.length; z++) {
            const c = chunkRow[z];
            if (c.g) {
              Scene.scene.remove(c.g);
            }
          }
        }
        chunks = getChunks(map);
        for (let x = 0; x < chunks.length; x++) {
          const chunkRow = chunks[x];
          for (let z = 0; z < chunkRow.length; z++) {
            const c = chunkRow[z];
            if (c.g) {
              Scene.scene.add(c.g);
            }
          }
        }
      },
    };
    game.run();
  });
}
