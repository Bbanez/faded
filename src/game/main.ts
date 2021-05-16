import {
  Scene,
  WebGLRenderer,
  PCFSoftShadowMap,
  DirectionalLight,
  Color,
  PerspectiveCamera,
  AmbientLight,
} from 'three';
import { createCameraService, createInputService } from './services';
import { createEntity } from './components';
import { createErrorHandler, DistanceUtil, Loader } from './util';
import type { ErrorHandlerPrototype, Game, GameConfig } from './types';
import { createTicker } from './ticker';
import { createControls } from './controls';

function createRenderer(el: HTMLElement) {
  const renderer = new WebGLRenderer();
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  el.appendChild(renderer.domElement);

  return renderer;
}
function createCamera() {
  const screenAspectRatio = window.innerWidth / window.innerHeight;
  const camera = new PerspectiveCamera(30, screenAspectRatio, 1, 1000);
  camera.position.set(20, 15, 20);
  camera.lookAt(0, 0, 0);
  return camera;
}
function createScene() {
  const scene = new Scene();
  scene.background = new Color(0, 0, 0);

  return scene;
}
function createGlobalLights(scene: Scene) {
  const ambientLight = new AmbientLight(0x404040);
  scene.add(ambientLight);

  const sun = new DirectionalLight(0xffffff);
  sun.position.set(-59, 100, 35);
  sun.castShadow = true;
  sun.lookAt(0, 0, 0);
  sun.shadow.mapSize.width = 4096;
  sun.shadow.mapSize.height = 4096;
  sun.shadow.camera.left = 100;
  sun.shadow.camera.right = -100;
  sun.shadow.camera.top = 100;
  sun.shadow.camera.bottom = -100;
  scene.add(sun);

  return {
    ambientLight,
    sun,
  };
}
async function createMap(
  error: ErrorHandlerPrototype,
  instance: number,
  scene: Scene
) {
  const maps = ['/assets/models/map1.gltf'];
  if (!maps[instance]) {
    throw error.break(
      'createMap',
      `Map for instance "${instance}"` + ' does not exist',
      'Available:',
      maps
    );
  }
  const terrainModel = await Loader.gltf('/assets/models/map1.gltf');
  terrainModel.scene.traverse((c) => {
    c.receiveShadow = true;
  });
  scene.add(terrainModel.scene);

  return {
    terrainModel,
  };
}
async function createCharacter(scene: Scene) {
  const character = await createEntity({
    model: {
      fbx: {
        main: '/assets/models/female/character.fbx',
        animations: {
          backward: '/assets/models/female/backward.fbx',
          idle: '/assets/models/female/idle.fbx',
          left: '/assets/models/female/left.fbx',
          right: '/assets/models/female/right.fbx',
          slowRun: '/assets/models/female/slow-run.fbx',
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
export async function createGame(config: GameConfig): Promise<Game> {
  const error = createErrorHandler('Initialize');
  const renderer = createRenderer(config.htmlElement);
  const camera = createCamera();
  const scene = createScene();
  createGlobalLights(scene);

  const input = createInputService();
  const cam = createCameraService({ camera, input });
  const ticker = createTicker();
  const controls = createControls(input);

  const map = await createMap(error, 0, scene);
  controls.setTerrain(map.terrainModel.scene);
  renderer.render(scene, camera);
  DistanceUtil.ground.setGeometry(map.terrainModel.scene);

  const character = await createCharacter(scene);
  cam.follow({ entity: character, far: 15, near: 2 });
  controls.controlEntity(character);

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
