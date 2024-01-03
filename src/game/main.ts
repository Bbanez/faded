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
import { Camera, createCamera } from './camera';

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

  private unsubs: Array<() => void> = [];

  constructor(config: GameConfig) {
    this.mapSlug = config.mapSlug;
    this.el = config.el;
    this.scene = new Scene();
    this.scene.background = new Color(0, 0, 0);
    this.camera = createCamera(this, {
      initPosition: [30, 85],
    });
    this.renderer = new Renderer(
      config.el,
      this.scene,
      this.camera.cam,
      config.renderer
    );
    Mouse.init();
    Keyboard.init();
    function frameTick() {
      requestAnimationFrame(frameTick);
      Ticker.tick();
    }
    if (config.frameTicker) {
      frameTick();
    }
    Ticker.reset();
    this.unsubs.push(
      Ticker.subscribe(async () => {
        await invoke('on_tick');
      })
    );
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
      }
    );
    const loaderUnsub = AssetLoader.onLoaded((item, data) => {
      if (item.name === 'ground') {
        this.assets.ground = (data as GLTF).scene;
        this.assets.ground.traverse((o) => {
          o.receiveShadow = true;
        });
        this.assets.ground.scale.set(50, 50, 50);
      } else if (item.name === 'skybox') {
        this.assets.skybox = data as CubeTexture;
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
    sun.target.position.set(100, 0, 100);
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
      new PlaneGeometry(100, 100),
      new MeshBasicMaterial({
        color: 0x00aaff,
        transparent: true,
        opacity: 0.5,
      })
    );
    water.rotation.x = -PI12;
    water.position.set(50, -0.2, 50);
    this.scene.add(water);
    this.renderer.onResize();
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
