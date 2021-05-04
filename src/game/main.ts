import {
  Scene,
  WebGLRenderer,
  PCFSoftShadowMap,
  DirectionalLight,
  Color,
  PerspectiveCamera,
  AmbientLight,
  Raycaster,
  Vector3,
  Group,
} from 'three';
import { ControlEngine, TickerEngine } from './engines';
import { CameraService, ConsoleService, InputService } from './services';
import { createEntity } from './components';
import { Loader } from './util';

async function main(): Promise<void> {
  const renderer = new WebGLRenderer();
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  const gameEl = document.getElementById('faded-game');
  if (!gameEl) {
    throw Error('Failed to find game container.');
  }
  gameEl.appendChild(renderer.domElement);

  const screenAspectRatio = window.innerWidth / window.innerHeight;
  const camera = new PerspectiveCamera(30, screenAspectRatio, 1, 1000);
  camera.position.set(20, 15, 20);
  camera.lookAt(0, 0, 0);
  const scene = new Scene();

  const light = new DirectionalLight(0xffffff);
  light.position.set(-59, 100, 35);
  light.castShadow = true;
  light.lookAt(0, 0, 0);
  // light.shadow.bias = -0.01;
  light.shadow.mapSize.width = 4096;
  light.shadow.mapSize.height = 4096;
  // light.shadow.camera.near = 1.0;
  // light.shadow.camera.far = 10;
  light.shadow.camera.left = 100;
  light.shadow.camera.right = -100;
  light.shadow.camera.top = 100;
  light.shadow.camera.bottom = -100;
  scene.add(light);
  scene.add(new AmbientLight(0x404040));
  scene.background = new Color(0, 0, 0);

  const consoleService = ConsoleService();
  const inputService = InputService();
  const cameraService = CameraService({ camera, inputService });
  const tickerEngine = TickerEngine();
  const controlEngine = ControlEngine(inputService);

  window.t = {
    services: {
      console: consoleService,
      input: inputService,
      camera: cameraService,
    },
    engine: {
      ticker: tickerEngine,
      control: controlEngine,
    },
    util: {
      loader: Loader,
    },
  };

  const terrainGltf = await Loader.gltf('/assets/models/map1.gltf');
  terrainGltf.scene.traverse((c) => {
    c.receiveShadow = true;
  });
  controlEngine.setTerrain(terrainGltf.scene);
  scene.add(terrainGltf.scene);

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
  // character.enableBBVisual(scene);
  character.addToScene(scene);
  character.playAnimation('idle');

  cameraService.follow({ entity: character, far: 15, near: 2 });
  controlEngine.controlEntity(character);
  async function addTrees(terrain: Group) {
    const ray = new Raycaster();
    const rayDir = new Vector3(0, -1, 0);
    const positions: Array<{ x: number; z: number }> = [
      { x: -1, z: 2 },
      { x: 5, z: 18 },
      { x: 10, z: 7 },
      { x: 9, z: 4 },
      { x: 11, z: 24 },
      { x: 6, z: 21 },
      { x: 29, z: 7 },
      { x: 17, z: 16 },
    ];
    const group = new Group();
    for (let i = 0; i < positions.length; i++) {
      const model = await Loader.gltf('/assets/models/map1/tree1.gltf');
      model.scene.traverse((c) => {
        c.castShadow = true;
      });
      model.scene.scale.setScalar(0.3);
      const position = positions[i];
      ray.set(new Vector3(position.x, 1000, position.z), rayDir);
      const intersect = ray.intersectObject(terrain, true);
      if (intersect[0]) {
        model.scene.position.set(position.x, intersect[0].point.y, position.z);
        group.add(model.scene);
      }
    }
    scene.add(group);
  }

  window.t.engine.ticker.register((t) => {
    controlEngine.update();
    cameraService.update();
    character.updateAnimationMixer(t / 1000);
    renderer.render(scene, camera);
  });

  setTimeout(() => {
    addTrees(terrainGltf.scene);
  }, 1000);
}

export const three = {
  init: main,
};
