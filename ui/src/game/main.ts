import {
  createSvemir,
  Loader,
  PI12,
  Point2D,
  Renderer,
  Scene,
  Ticker,
} from 'svemir';
import { Svemir } from 'svemir/types';
import {
  AmbientLight,
  CubeTexture,
  DirectionalLight,
  Material,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  RepeatWrapping,
  Texture,
} from 'three';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
// import { Water } from 'three/examples/jsm/objects/Water';
import { Sky } from 'three/examples/jsm/objects/Sky';
import { Assets } from './assets';
import { createCamera } from './camera';
import { createCharacter } from './character';
import { MouseRay } from './mouse-ray';

export interface Game {
  svemir: Svemir;
  destroy(): void;
}

export async function createGame(config: {
  canvas: HTMLElement;
  mapId: string;
  camLookAt: Point2D;
}): Promise<Game> {
  const unsubs: Array<() => void> = [];
  Loader.register({
    name: 'ground',
    path: `/assets/maps/${config.mapId}/ground.gltf`,
    type: 'gltf',
  });
  Loader.register({
    name: 'waterNormals',
    path: '/assets/waternormals.jpg',
    type: 'texture',
  });
  Loader.register({
    name: 'skybox',
    path: [
      `/assets/maps/${config.mapId}/skybox/xn.png`,
      `/assets/maps/${config.mapId}/skybox/xp.png`,
      `/assets/maps/${config.mapId}/skybox/yp.png`,
      `/assets/maps/${config.mapId}/skybox/yn.png`,
      `/assets/maps/${config.mapId}/skybox/zp.png`,
      `/assets/maps/${config.mapId}/skybox/zn.png`,
    ],
    type: 'cubeTexture',
  });
  unsubs.push(
    Loader.onLoaded((item, data) => {
      if (item.name === 'ground') {
        Assets.ground = (data as GLTF).scene;
        Assets.ground.traverse((o) => {
          // o.castShadow = true;
          o.receiveShadow = true;
        });
        // ((Assets.ground.children[0] as Mesh).material as Material).transparent =
        //   true;
        // (
        //   (Assets.ground.children[0] as Mesh).material as Material
        // ).opacity = 0.5;
        console.log(Assets.ground);
        Assets.ground.scale.set(50, 50, 50);
        // Assets.ground.position.set(100, 0, 100);
      } else if (item.name === 'waterNormals') {
        Assets.waterNormals = data as Texture;
        Assets.waterNormals.wrapS = Assets.waterNormals.wrapT = RepeatWrapping;
      } else if (item.name === 'skybox') {
        Assets.skybox = data as CubeTexture;
      }
    }),
  );
  await Loader.run();

  const svemir = await new Promise<Svemir>((resolve) => {
    const s = createSvemir({
      element: config.canvas,
      frameTicker: true,
      renderer: {
        size: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
      },
      async onReady() {
        resolve(s);
      },
    });
    s.run();
  });
  Scene.scene.add(Assets.ground);

  Scene.scene.background = Assets.skybox;

  const sun = new DirectionalLight(0xffffff);
  sun.position.set(-0, 10, 0);
  sun.castShadow = true;
  sun.target.position.set(100, 0, 100);
  sun.shadow.mapSize.width = 8000;
  sun.shadow.mapSize.height = 8000;
  sun.shadow.camera.left = 100;
  sun.shadow.camera.right = 0;
  sun.shadow.camera.top = -100;
  sun.shadow.camera.bottom = 0;
  Scene.scene.add(sun);
  const ambientLight = new AmbientLight(0xffffff, 0);
  Scene.scene.add(ambientLight);

  const sky = new Sky();
  sky.position.set(50, 0, 50);
  sky.scale.setScalar(100);
  Scene.scene.add(sky);
  const skyUniforms = sky.material.uniforms;
  skyUniforms['turbidity'].value = 10;
  skyUniforms['rayleigh'].value = 2;
  skyUniforms['mieCoefficient'].value = 0.005;
  skyUniforms['mieDirectionalG'].value = 0.8;

  const water = new Mesh(
    new PlaneGeometry(100, 100),
    new MeshBasicMaterial({
      color: 0x00aaff,
      transparent: true,
      opacity: 0.5,
    }),
  );
  // const waterG = new PlaneGeometry(100, 100);
  // const water = new Water(waterG, {
  //   textureWidth: 256,
  //   textureHeight: 256,
  //   waterNormals: Assets.waterNormals,
  //   sunDirection: new Vector3(sun.position.x, sun.position.y, sun.position.z),
  //   sunColor: 0xffffff,
  //   waterColor: 0x00aaff,
  //   distortionScale: 5.7,
  //   fog: Scene.scene.fog !== undefined,
  // });
  water.rotation.x = -PI12;
  water.position.set(50, -0.2, 50);
  Scene.scene.add(water);

  const g = new Mesh(
    new PlaneGeometry(100, 100),
    new MeshBasicMaterial({
      color: 0x00aaff,
    }),
  );
  g.position.set(50, 0.1, 50);

  const camera = await createCamera({
    initPosition: config.camLookAt,
  });
  Renderer.setCamera(camera.cam);

  const mouseRay = new MouseRay(camera.cam, [Assets.ground]);
  unsubs.push(
    mouseRay.subscribe((inter) => {
      if (inter[0]) {
        char.setPosition(new Point2D(inter[0].point.x, inter[0].point.z));
      }
    }),
  );

  const char = await createCharacter({
    position: config.camLookAt,
    id: 'archer',
  });
  unsubs.push(
    Ticker.subscribe((_t, d) => {
      camera.update();
      camera.setPosition(char.position());
      char.update(d / 500);
      // water.material.uniforms['time'].value += 1.0 / 100.0;
    }),
  );

  // function updateSun() {
  //   sky.material.uniforms['sunPosition'].value.copy(sun);
  //   water.material.uniforms['sunDirection'].value.copy(sun).normalize();
  // }
  // updateSun();

  return {
    svemir,

    destroy() {
      svemir.destroy();
      unsubs.forEach((e) => e());
      window.location.reload();
    },
  };
}
