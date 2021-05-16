import {
  Scene,
  WebGLRenderer,
  PCFSoftShadowMap,
  DirectionalLight,
  Color,
  PerspectiveCamera,
  AmbientLight,
  Texture,
  Vector3,
} from 'three';
import { createCameraService, createInputService } from './services';
import { createEntity } from './components';
import {
  createErrorHandler,
  createParticleSystem,
  DensityMap,
  DistanceUtil,
  FunctionBuilder,
  Loader,
} from './util';
import type {
  ErrorHandlerPrototype,
  Game,
  GameConfig,
  ParticleSystemPrototype,
  Point2D,
} from './types';
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
  const maps = ['/assets/models/map-1.gltf'];
  if (!maps[instance]) {
    throw error.break(
      'createMap',
      `Map for instance "${instance}"` + ' does not exist',
      'Available:',
      maps
    );
  }
  const terrainModel = await Loader.gltf(maps[instance]);
  terrainModel.scene.scale.setScalar(200);
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
  const controls = createControls(input, cam);

  const map = await createMap(error, 0, scene);
  controls.setTerrain(map.terrainModel.scene);
  renderer.render(scene, camera);
  DistanceUtil.ground.setGeometry(map.terrainModel.scene);

  const character = await createCharacter(scene);
  cam.follow({ entity: character, far: 150, near: 2 });
  controls.controlEntity(character);

  // const testTree = await Loader.gltf('/assets/models/tadia-tree-1.gltf');
  // testTree.scene.traverse((c) => {
  //   c.castShadow = true;
  //   c.receiveShadow = true;
  // });
  // testTree.scene.position.set(0, DistanceUtil.ground.height({ x: 0, y: 0 }), 0);
  // scene.add(testTree.scene);

  const grassTexture = await Loader.texture('/assets/grass.png');
  const grassMap = await Loader.texture(`/assets/density-maps/map-0/grass.jpg`);
  const grassDensityMap = DensityMap.getPixelArray(grassMap, 'g');

  function placeParticlesFromDensityMap(
    dMap: number[],
    texture: Texture
  ): ParticleSystemPrototype {
    const system = createParticleSystem({
      texture,
    });
    system.useCamera(camera);
    system.addTo(scene);
    const mapSize = 199;
    const stepSize = 2;
    let z = -mapSize;
    let x = -mapSize;
    const grassCountFn = FunctionBuilder.linear.d2d([
      {
        x: 0,
        y: 0,
      },
      {
        x: 100,
        y: 3,
      },
      {
        x: 255,
        y: 15,
      },
    ]);
    for (let i = 0; i < dMap.length; i++) {
      const item = dMap[i];
      const grassCount = grassCountFn(item);
      if (grassCount > 0) {
        const y = DistanceUtil.ground.height({ x, y: z });
        for (let j = 0; j < grassCount; j++) {
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
      x += stepSize;
      if (x > mapSize) {
        x = -mapSize;
        z += stepSize;
      }
    }
    system.updateParticles();
    system.updateGeometry();

    return system;
  }
  placeParticlesFromDensityMap(grassDensityMap, grassTexture);

  ticker.register((t) => {
    controls.update();
    cam.update();
    character.updateAnimationMixer(t / 1000);
    renderer.render(scene, camera);
  });
  ticker.start();
  // setInterval(() => {
  //   console.log(character.getPosition());
  // }, 1000);

  return {
    character,
    camera: cam,
    ticker,
    input,
    controls,
  };
}
