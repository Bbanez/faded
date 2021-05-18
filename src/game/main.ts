import {
  Scene,
  WebGLRenderer,
  PCFSoftShadowMap,
  DirectionalLight,
  Color,
  PerspectiveCamera,
  AmbientLight,
  Vector3,
  Texture,
  PointLight,
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
  Point3D,
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
async function createMap(
  error: ErrorHandlerPrototype,
  mapIndex: number,
  scene: Scene
) {
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
async function createCharacter(scene: Scene) {
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
export async function createGame(config: GameConfig): Promise<Game> {
  const mapIndex = 0;
  const error = createErrorHandler('Initialize');
  const renderer = createRenderer(config.htmlElement);
  const camera = createCamera();
  const scene = createScene();
  createGlobalLights(scene);

  const input = createInputService();
  const cam = createCameraService({ camera, input });
  const ticker = createTicker();
  const controls = createControls(input, cam);

  const map = await createMap(error, mapIndex, scene);
  controls.setTerrain(map.terrainModel.scene);
  renderer.render(scene, camera);
  DistanceUtil.ground.setGeometry(map.terrainModel.scene);

  const character = await createCharacter(scene);
  cam.follow({ entity: character, far: 35, near: 2 });
  controls.controlEntity(character);

  // const testTree = await Loader.gltf('/assets/character/tadia-terrain.gltf');
  // testTree.scene.traverse((c) => {
  //   c.castShadow = true;
  //   c.receiveShadow = true;
  // });
  // testTree.scene.position.set(0, DistanceUtil.ground.height({ x: 0, y: 0 }), 0);
  // scene.add(testTree.scene);

  const grassTexture = await Loader.texture(
    `/assets/map/${mapIndex}/grass.png`
  );
  const grassMap = await Loader.texture(
    `/assets/map/${mapIndex}/masks/grass.png`
  );
  const grassDensityMap = DensityMap.getPixelArray(grassMap, 'g');
  const treeMap = await Loader.texture(
    `/assets/map/${mapIndex}/masks/tree.png`
  );
  const treeDensityMap = DensityMap.getPixelArray(treeMap, 'r');

  async function placeModelsFromMap(dMap: number[]) {
    const _tree = await Loader.gltf(`/assets/map/${mapIndex}/trees/0.gltf`);
    const _treeSmall = await Loader.gltf(
      `/assets/map/${mapIndex}/trees/1.gltf`
    );
    const _treeBush = await Loader.gltf(`/assets/map/${mapIndex}/trees/2.gltf`);
    _tree.scene.traverse((c) => {
      c.castShadow = true;
    });
    _treeSmall.scene.traverse((c) => {
      c.castShadow = true;
    });
    const mapSize = 199;
    const stepSize = 2;
    let z = -mapSize;
    let x = -mapSize;
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
    for (let i = 0; i < dMap.length; i++) {
      const item = dMap[i];
      // const treeCount = treeCountFn(item);
      if (item > 253) {
        const y = DistanceUtil.ground.height({ x, y: z });
        for (let j = 0; j < 1; j++) {
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
        }
      } else if (item > 140 && item < 160) {
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
      } else if (item > 0) {
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
      x += stepSize;
      if (x > mapSize) {
        x = -mapSize;
        z += stepSize;
      }
    }
  }
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
  await placeModelsFromMap(treeDensityMap);

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
