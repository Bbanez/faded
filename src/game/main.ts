import { v4 as uuidv4 } from 'uuid';
import {
  AmbientLight,
  Color,
  CubeTexture,
  DirectionalLight,
  Group,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  Scene,
  Texture,
} from 'three';
import { Renderer, RendererConfig } from './renderer';
import { Mouse } from './mouse';
import { Keyboard } from './keyboard';
import { Ticker } from './ticker';
import { FddMapEntryMeta } from '../types/bcms';
import { bcms, loadBcmsData } from './bcms';
import { invoke } from '@tauri-apps/api';
import { AssetLoader } from './asset-loader';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { PI12 } from './consts';
import { Camera } from './camera';
import { Player, createPlayer } from './player';
import { getImageData } from './util';
import type { Nogo, RustNogo } from '../types';
import { FunctionBuilder } from './math';

export interface GameConfig {
  el: HTMLElement;
  frameTicker?: boolean;
  renderer?: RendererConfig;
  mapSlug: string;
}

export class Game {
  id = uuidv4();
  scene: Scene;
  renderer: Renderer;
  el: HTMLElement;
  mapData: FddMapEntryMeta = null as never;
  mapSlug: string;
  assets: {
    ground: Group;
    skybox: CubeTexture;
  } = {} as never;
  camera: Camera;
  player: Player | null = null;
  nogo: Nogo | null = null;
  frameTicker: boolean;
  frameTimeFn = FunctionBuilder.linear2D([
    [500, 2],
    [1000, 1],
  ]);

  private unsubs: Array<() => void> = [];

  constructor(config: GameConfig) {
    this.mapSlug = config.mapSlug;
    this.el = config.el;
    this.scene = new Scene();
    this.scene.background = new Color(0, 0, 0);
    this.camera = new Camera(this, [50, 50]);
    this.renderer = new Renderer(
      config.el,
      this.scene,
      this.camera.cam,
      config.renderer,
    );
    Mouse.init();
    Keyboard.init();

    Ticker.reset();
    this.unsubs.push(
      Ticker.subscribe(async () => {
        await invoke('on_tick');
      }),
    );

    if (config.frameTicker) {
      this.frameTicker = true;
      this.frameTick().catch((err) => console.error(err));
    } else {
      this.frameTicker = false;
    }
  }

  private async frameTick() {
    await Ticker.tick();
    if (this.frameTicker) {
      requestAnimationFrame(async () => {
        await this.frameTick();
      });
    }
  }

  async run() {
    await loadBcmsData();
    const mapData = bcms.maps.find((e) => e.slug === this.mapSlug);
    if (!mapData) {
      throw Error(`Failed to load map "${this.mapSlug}"`);
    }
    this.mapData = mapData;
    AssetLoader.register(
      {
        name: 'ground',
        path: this.mapData.ground.src,
        type: 'gltf',
      },
      {
        name: 'skybox',
        path: [
          mapData.skybox.xn.src,
          mapData.skybox.xp.src,
          mapData.skybox.yp.src,
          mapData.skybox.yn.src,
          mapData.skybox.zp.src,
          mapData.skybox.zn.src,
        ],
        type: 'cubeTexture',
      },
      {
        name: 'nogo',
        path: this.mapData.nogo.src,
        type: 'texture',
      },
    );
    const loaderUnsub = AssetLoader.onLoaded(async (item, data) => {
      if (item.name === 'ground') {
        this.assets.ground = (data as GLTF).scene;
        this.assets.ground.traverse((o) => {
          o.receiveShadow = true;
          // o.castShadow = true;
        });
        this.assets.ground.scale.set(mapData.width / 2, 50, mapData.height / 2);
      } else if (item.name === 'skybox') {
        this.assets.skybox = data as CubeTexture;
      } else if (item.name === 'nogo') {
        const imageData = getImageData(data as Texture);
        const pixels: number[] = [];
        for (let i = 0; i < imageData.data.length; i += 4) {
          const pixel = imageData.data[i];
          pixels.push(pixel);
        }
        const rustNogo = await invoke<RustNogo>('nogo_set', {
          pixels,
          mapSlug: this.mapSlug,
        });
        this.nogo = {
          ...rustNogo,
          map_x_trans: FunctionBuilder.linear2D([
            [0, 0],
            [rustNogo.width, rustNogo.map_width],
          ]),
          map_z_trans: FunctionBuilder.linear2D([
            [0, 0],
            [rustNogo.height, rustNogo.map_height],
          ]),
        };
      }
    });
    await AssetLoader.run();
    loaderUnsub();
    this.scene.add(this.assets.ground);
    this.scene.background = this.assets.skybox;

    const sun = new DirectionalLight(0xffffff, 1);
    sun.position.set(0, 50, 0);
    sun.castShadow = true;
    const sunRes = 2000;
    const sunGroundSize = 20;
    sun.shadow.mapSize.width = sunRes;
    sun.shadow.mapSize.height = sunRes;
    sun.shadow.camera.left = sunGroundSize;
    sun.shadow.camera.right = -sunGroundSize;
    sun.shadow.camera.top = sunGroundSize;
    sun.shadow.camera.bottom = -sunGroundSize;
    sun.target.position.set(30, 0, 85);
    this.scene.add(sun);
    this.scene.add(sun.target);
    this.unsubs.push(
      Ticker.subscribe(async () => {
        if (this.player) {
          sun.target.position.set(
            this.player.model.position.x,
            this.player.model.position.y,
            this.player.model.position.z,
          );
        }
      }),
    );
    const ambientLight = new AmbientLight(0xffffff, 1.5);
    this.scene.add(ambientLight);

    const water = new Mesh(
      new PlaneGeometry(mapData.width, mapData.height),
      new MeshBasicMaterial({
        color: 0x00aaff,
        transparent: true,
        opacity: 0.5,
      }),
    );
    water.rotation.x = -PI12;
    water.position.set(mapData.width / 2, -0.2, mapData.height / 2);
    this.scene.add(water);
    this.renderer.onResize();

    this.player = await createPlayer(this, 'demo', 'demo');
    this.scene.add(this.player.model);
    this.player.animation.play('run');
    this.camera.follow(this.player);

    // const nogo = this.nogo as RustNogo;
    // console.log('nogo', nogo);
    // for (let i = 0; i < nogo.nodes.length; i++) {
    //   const node = nogo.nodes[i];
    //   const plane = new Mesh(
    //     new PlaneGeometry(nogo.map_node_width, nogo.map_node_height),
    //     new MeshBasicMaterial({
    //       color: node.valid ? 0x000000 : 0xffffff,
    //     }),
    //   );
    //   plane.rotation.x = -PI12;
    //   plane.position.set(node.map_position[0], 10, node.map_position[1]);
    //   this.scene.add(plane);
    // }
    // await PathFinding.a_star(this, nogo.nodes[0], nogo.nodes[99], nogo);
  }

  destroy() {
    while (this.unsubs.length > 0) {
      const unsub = this.unsubs.pop();
      if (unsub) {
        unsub();
      }
    }
    this.scene.clear();
    this.renderer.destroy();
    this.el.innerHTML = '';
    this.player?.destroy();
    this.camera.destroy();
    Mouse.destroy();
    Keyboard.destroy();
    Ticker.clear();
    this.frameTicker = false;
  }
}
