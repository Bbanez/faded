import {
  AmbientLight,
  Color,
  DirectionalLight,
  PCFSoftShadowMap,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from 'three';
import { createControls } from './controls';
import {
  createCameraService,
  createInputService,
  // createStorage,
} from './services';
import { createTicker } from './ticker';
import type { Game, GameConfig } from './types';
import {
  createCharacter,
  createErrorHandler,
  // createGrass,
  // createHeightMap,
  createMap,
  createSkybox,
  // createTrees,
  DistanceUtil,
  TimeTrackerUtil,
} from './util';

function createRenderer(el: HTMLElement): WebGLRenderer {
  const renderer = new WebGLRenderer();
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  el.appendChild(renderer.domElement);

  return renderer;
}
function createCamera(): PerspectiveCamera {
  const screenAspectRatio = window.innerWidth / window.innerHeight;
  const camera = new PerspectiveCamera(30, screenAspectRatio, 1, 1000);
  camera.position.set(20, 15, 20);
  camera.lookAt(0, 0, 0);
  return camera;
}
function createScene(): Scene {
  const scene = new Scene();
  scene.background = new Color(0, 0, 0);

  return scene;
}
function createGlobalLights(scene: Scene): {
  ambientLight: AmbientLight;
  sun: DirectionalLight;
} {
  const ambientLight = new AmbientLight(0x404040);
  scene.add(ambientLight);

  const sun = new DirectionalLight(0x433d4a);
  sun.position.set(-59, 100, 35);
  sun.castShadow = true;
  sun.lookAt(0, 0, 0);
  sun.shadow.mapSize.width = 4096;
  sun.shadow.mapSize.height = 4096;
  sun.shadow.camera.left = 200;
  sun.shadow.camera.right = -200;
  sun.shadow.camera.top = 200;
  sun.shadow.camera.bottom = -200;
  scene.add(sun);

  return {
    ambientLight,
    sun,
  };
}

export async function createGame(config: GameConfig): Promise<Game> {
  const timeOffset = Date.now();
  const mapIndex = 0;
  const error = createErrorHandler('Initialize');
  // const storage = createStorage({ prfx: 'faded' });
  const renderer = await TimeTrackerUtil.track.timeToComplete(
    'Create renderer',
    () => createRenderer(config.htmlElement)
  );
  const camera = await TimeTrackerUtil.track.timeToComplete(
    'Create camera',
    () => createCamera()
  );
  const scene = await TimeTrackerUtil.track.timeToComplete('Create scene', () =>
    createScene()
  );
  await TimeTrackerUtil.track.timeToComplete('Create global lights', () =>
    createGlobalLights(scene)
  );

  const input = await TimeTrackerUtil.track.timeToComplete(
    'Create input service',
    () => createInputService()
  );
  const cam = await TimeTrackerUtil.track.timeToComplete(
    'Create camera service',
    () => createCameraService({ camera, input })
  );
  const ticker = await TimeTrackerUtil.track.timeToComplete(
    'Create ticker',
    () => createTicker()
  );
  const controls = await TimeTrackerUtil.track.timeToComplete(
    'Create controls',
    () => createControls(input, cam)
  );

  const map = await TimeTrackerUtil.track.timeToComplete(
    'Create map',
    async () => await createMap(error, mapIndex, scene)
  );
  controls.setTerrain(map.terrainModel.scene);
  renderer.render(scene, camera);
  DistanceUtil.ground.setGeometry(map.terrainModel.scene);

  await createSkybox({ mapIndex, scene });

  // const terrainHeightMap = await TimeTrackerUtil.track.timeToComplete(
  //   'Create terrain height map',
  //   () =>
  //     createHeightMap({
  //       id: `map${mapIndex}`,
  //       storage,
  //       group: map.terrainModel.scene,
  //       x: {
  //         start: -199,
  //         end: 199,
  //       },
  //       z: {
  //         start: -199,
  //         end: 199,
  //       },
  //       stepSize: {
  //         x: 1,
  //         z: 1,
  //       },
  //     })
  // );
  // await TimeTrackerUtil.track.timeToComplete(
  //   'Create grass',
  //   async () =>
  //     await createGrass({
  //       heightMap: terrainHeightMap,
  //       scene,
  //       camera,
  //       mapIndex,
  //     })
  // );
  // await TimeTrackerUtil.track.timeToComplete(
  //   'Create trees',
  //   async () =>
  //     await createTrees({
  //       heightMap: terrainHeightMap,
  //       scene,
  //       mapIndex,
  //     })
  // );

  const character = await TimeTrackerUtil.track.timeToComplete(
    'Create character',
    async () => await createCharacter(scene)
  );
  cam.follow({ entity: character, far: 150, near: 2 });
  controls.controlEntity(character);

  console.log(`Game ready in ${(Date.now() - timeOffset) / 1000}s`);

  ticker.register((t) => {
    controls.update();
    cam.update();
    character.updateAnimationMixer(t / 1000);
    renderer.render(scene, camera);
  });
  ticker.start();

  return {
    character,
    camera: cam,
    ticker,
    input,
    controls,
  };
}
