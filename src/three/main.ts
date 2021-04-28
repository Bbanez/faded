import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  BoxGeometry,
  Mesh,
  PCFSoftShadowMap,
  DirectionalLight,
  AmbientLight,
  CubeTextureLoader,
  PlaneGeometry,
  MeshStandardMaterial,
} from 'three';
import { TickerEngine } from './engines';
import { CameraService, ConsoleService, InputService } from './services';
import { InputServiceSubscriptionType } from './types';

async function main() {
  const renderer = new WebGLRenderer();
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const camera = new PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.set(75, 20, 0);

  const scene = new Scene();

  const light = new DirectionalLight(0xffffff);
  light.position.set(0, 100, 100);
  light.castShadow = true;
  light.shadow.bias = -0.01;
  light.shadow.mapSize.width = 2048;
  light.shadow.mapSize.height = 2048;
  light.shadow.camera.near = 1.0;
  light.shadow.camera.far = 200;
  light.shadow.camera.left = 110;
  light.shadow.camera.right = -10;
  light.shadow.camera.top = 10;
  light.shadow.camera.bottom = -10;
  scene.add(light);
  scene.add(new AmbientLight(0x404040));

  const loader = new CubeTextureLoader();
  const texture = loader.load([
    '/assets/skybox/front.jpg',
    '/assets/skybox/back.jpg',
    '/assets/skybox/up.jpg',
    '/assets/skybox/down.jpg',
    '/assets/skybox/left.jpg',
    '/assets/skybox/right.jpg',
  ]);
  scene.background = texture;

  window.t = {
    services: {
      console: ConsoleService(),
      input: InputService(),
      camera: undefined as never,
    },
    engine: {
      ticker: TickerEngine(),
    },
  };
  window.t.services.camera = CameraService({ camera });

  const plane = new Mesh(
    new PlaneGeometry(100, 100, 1, 1),
    new MeshStandardMaterial({ color: 0xffffff })
  );
  plane.castShadow = true;
  plane.receiveShadow = true;
  plane.rotation.x = -Math.PI / 2;
  scene.add(plane);

  const box = new Mesh(
    new BoxGeometry(2, 2, 8),
    new MeshStandardMaterial({ color: 0x808080 })
  );
  box.position.set(0, 3, 0);
  box.castShadow = true;
  box.receiveShadow = true;
  scene.add(box);
  const boxMoveBy = {
    x: 0,
    y: 0,
    z: 0,
  };

  window.t.services.input.subscribe(
    InputServiceSubscriptionType.KEY_DOWN,
    (_type, state) => {
      if (state.keyboard.key === 'w') {
        boxMoveBy.x = -1;
      } else if (state.keyboard.key === 's') {
        boxMoveBy.x = 1;
      } else if (state.keyboard.key === 'a') {
        boxMoveBy.z = 1;
      } else if (state.keyboard.key === 'd') {
        boxMoveBy.z = -1;
      }
    }
  );
  window.t.services.input.subscribe(
    InputServiceSubscriptionType.KEY_UP,
    (_type, state) => {
      if (state.keyboard.key === 'w' || state.keyboard.key === 's') {
        boxMoveBy.x = 0;
      } else if (state.keyboard.key === 'a' || state.keyboard.key === 'd') {
        boxMoveBy.z = 0;
      }
    }
  );

  window.t.services.camera.follow({ object: box, far: 100, near: 50 });

  window.t.engine.ticker.register(() => {
    box.rotation.y += 0.01;
    box.position.x += boxMoveBy.x;
    box.position.y += boxMoveBy.y;
    box.position.z += boxMoveBy.z;
    renderer.render(scene, camera);
  });
}

export const three = {
  init: main,
};
