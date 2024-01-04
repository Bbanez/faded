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

export interface GameConfig {
  el: HTMLElement;
  frameTicker?: boolean;
  renderer?: RendererConfig;
  mapSlug: string;
}

export class Game {
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

  private unsubs: Array<() => void> = [];

  constructor(config: GameConfig) {
    this.mapSlug = config.mapSlug;
    this.el = config.el;
    this.scene = new Scene();
    this.scene.background = new Color(0, 0, 0);
    this.camera = new Camera(this, [30, 85]);
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

    async function frameTick() {
      await Ticker.tick();
      requestAnimationFrame(frameTick);
    }
    if (config.frameTicker) {
      frameTick().catch((err) => console.error(err));
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
        });
        this.assets.ground.scale.set(mapData.width / 2, 50, mapData.height / 2);
      } else if (item.name === 'skybox') {
        this.assets.skybox = data as CubeTexture;
      } else if (item.name === 'nogo') {
        const imageData = getImageData(data as Texture);
        const pixels: number[] = [];
        for (let i = 0; i < imageData.data.length; i++) {
          const pixel = imageData.data[i];
          pixels.push(pixel);
        }
        await invoke('nogo_set', {
          pixels,
          mapSlug: this.mapSlug,
        });
      }
    });
    await AssetLoader.run();
    loaderUnsub();
    this.scene.add(this.assets.ground);
    this.scene.background = this.assets.skybox;
    // this.scene.background = new Color(255, 0, 0);

    const sun = new DirectionalLight(0xffffff);
    sun.position.set(-0, 10, 0);
    sun.castShadow = true;
    sun.target.position.set(mapData.width, 0, mapData.height);
    sun.shadow.mapSize.width = 8000;
    sun.shadow.mapSize.height = 8000;
    sun.shadow.camera.left = 100;
    sun.shadow.camera.right = 0;
    sun.shadow.camera.top = -100;
    sun.shadow.camera.bottom = 0;
    this.scene.add(sun);
    const ambientLight = new AmbientLight(0xffffff, 0);
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

    this.player = await createPlayer(this, 'demo');
    console.log(this.player.rust);
    this.scene.add(this.player.model);
    this.player.animation.play('run');
    this.camera.follow(this.player);
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
  }
}
