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
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  RepeatWrapping,
  Texture,
} from 'three';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
// import { Water } from 'three/examples/jsm/objects/Water';
// import { Sky } from 'three/examples/jsm/objects/Sky';
import { Assets } from './assets';
import { createCamera } from './camera';
import { createCharacter } from './character';
import { MouseRay } from './mouse-ray';
import { Nogo } from './nogo';

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
  Loader.register({
    name: 'nogo',
    path: `/assets/maps/${config.mapId}/nogo-150x150.jpg`,
    type: 'texture',
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
        Assets.ground.scale.set(50, 50, 50);
        // Assets.ground.position.set(100, 0, 100);
      } else if (item.name === 'waterNormals') {
        Assets.waterNormals = data as Texture;
        Assets.waterNormals.wrapS = Assets.waterNormals.wrapT = RepeatWrapping;
      } else if (item.name === 'skybox') {
        Assets.skybox = data as CubeTexture;
      } else if (item.name === 'nogo') {
        Assets.nogo = data as Texture;
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

  const nogo = new Nogo(Assets.nogo, new Point2D(100, 100));
  // for (let z = 0; z < nogo.obstacles.length; z++) {
  //   for (let x = 0; x < nogo.obstacles[z].length; x++) {
  //     const obstacle = nogo.obstacles[z][x];
  //     if (obstacle) {
  //       const g = new Mesh(
  //         new BoxGeometry(obstacle.qa, 1, obstacle.qb),
  //         new MeshBasicMaterial({
  //           color: 0xffffff,
  //         }),
  //       );
  //       g.position.set(obstacle.q.x, 0, obstacle.q.z);
  //       Scene.scene.add(g);
  //     }
  //   }
  // }

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

  // const sky = new Sky();
  // sky.position.set(50, 0, 50);
  // sky.scale.setScalar(100);
  // Scene.scene.add(sky);
  // const skyUniforms = sky.material.uniforms;
  // skyUniforms['turbidity'].value = 10;
  // skyUniforms['rayleigh'].value = 2;
  // skyUniforms['mieCoefficient'].value = 0.005;
  // skyUniforms['mieDirectionalG'].value = 0.8;

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

  // const plane = new Mesh(
  //   new PlaneGeometry(100, 100),
  //   // new MeshLambertMaterial({ map: Assets.nogo }),
  //   new MeshBasicMaterial({ color: 0xffffff }),
  // );
  // plane.rotation.x = -PI12;
  // plane.position.set(50, 10, 50);
  // Scene.scene.add(plane);

  const mouseRay = new MouseRay(camera.cam, [Assets.ground]);
  unsubs.push(
    mouseRay.subscribe((inter) => {
      if (inter[0]) {
        const p = new Point2D(inter[0].point.x, inter[0].point.z);
        char.setPosition(p);
        // nogo.aStar(char.position(), p);
      }
    }),
  );

  const char = await createCharacter({
    nogo,
    position: config.camLookAt,
    id: 'archer',
  });
  unsubs.push(
    Ticker.subscribe((_t, d) => {
      // camera.cam.lookAt(50, 0, 50);
      // camera.cam.position.set(50, 120, 50);
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

  // await nogo.aStar(new Point2D(10, 10), new Point2D(85, 85));

  return {
    svemir,

    destroy() {
      svemir.destroy();
      unsubs.forEach((e) => e());
      window.location.reload();
    },
  };
}
