import {
  Scene,
  WebGLRenderer,
  BoxGeometry,
  Mesh,
  PCFSoftShadowMap,
  DirectionalLight,
  MeshStandardMaterial,
  Color,
  PerspectiveCamera,
  AmbientLight,
} from 'three';
import { ControlEngine, TickerEngine } from './engines';
import { CameraService, ConsoleService, InputService } from './services';

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
  const camera = new PerspectiveCamera(30, screenAspectRatio, 10, 1000);
  camera.position.set(100, 100, 100);
  camera.lookAt(0, 0, 0);
  const scene = new Scene();

  const light = new DirectionalLight(0xffffff);
  light.position.set(100, 100, 0);
  light.castShadow = true;
  light.shadow.bias = -0.01;
  light.shadow.mapSize.width = 2048;
  light.shadow.mapSize.height = 2048;
  light.shadow.camera.near = 1.0;
  light.shadow.camera.far = 200;
  light.shadow.camera.left = 110;
  light.shadow.camera.right = -100;
  light.shadow.camera.top = 100;
  light.shadow.camera.bottom = -100;
  scene.add(light);
  scene.add(new AmbientLight(0x404040));

  // const loader = new CubeTextureLoader();
  // const texture = loader.load([
  //   '/assets/skybox/front.jpg',
  //   '/assets/skybox/back.jpg',
  //   '/assets/skybox/up.jpg',
  //   '/assets/skybox/down.jpg',
  //   '/assets/skybox/left.jpg',
  //   '/assets/skybox/right.jpg',
  // ]);
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
  };

  const box = new Mesh(
    new BoxGeometry(2, 2, 8),
    new MeshStandardMaterial({
      color: 0x808080,
    })
  );
  box.rotation.y = Math.PI / 2;
  box.position.set(0, 2, 0);
  box.castShadow = true;
  box.receiveShadow = true;
  scene.add(box);

  const base = new Mesh(
    new BoxGeometry(100, 2, 100),
    new MeshStandardMaterial({ color: 0xffffff })
  );
  base.receiveShadow = true;
  scene.add(base);

  const bb = new Mesh(
    new BoxGeometry(2, 2, 8),
    new MeshStandardMaterial({ color: 0x808080 })
  );
  bb.position.set(0, 2, 0);
  scene.add(bb);

  cameraService.follow({ object: box, far: 100, near: 50 });
  controlEngine.controlObject(box);

  // const modelLoader = new GLTFLoader();
  // modelLoader.load('/assets/models/plane.gltf', (gltf) => {
  //   gltf.scene.traverse((c) => {
  //     c.receiveShadow = true;
  //   });
  //   scene.add(gltf.scene);
  // });

  window.t.engine.ticker.register(() => {
    // light.position.set(
    //   camera.position.x + 10,
    //   camera.position.y + 10,
    //   camera.position.z + 10
    // );
    // light.lookAt(box.position);
    controlEngine.update();
    cameraService.update();
    renderer.render(scene, camera);
  });
}

export const three = {
  init: main,
};
