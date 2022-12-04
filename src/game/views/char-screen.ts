import {
  FunctionBuilder,
  Loader,
  PI12,
  Renderer,
  Scene,
} from 'svemir';
import {
  AmbientLight,
  DirectionalLight,
  DirectionalLightHelper,
  Group,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
} from 'three';
import { bcmsMediaToUrl } from '@becomes/cms-most/frontend';
import type { FadedCharacterSelectionScreenEntryMeta } from '../../bcms/types';
import { BCMS } from '../../services';
import { Config } from '../config';
import type { Linear2DFn, Svemir } from 'svemir/types';
import { createPlayer, Player } from '../player';

export class GameCharScreen {
  private sceneEntry: FadedCharacterSelectionScreenEntryMeta = null as never;
  private sceneObjects: Array<any> = [];
  private camera: PerspectiveCamera = null as never;
  private fovFn: Linear2DFn = null as never;
  private player: Player = null as never;
  private ground: Group | Object3D | Mesh = null as never;

  constructor(private game: Svemir) {}

  private async loadAssets() {
    this.ground = new Mesh(
      new PlaneGeometry(20, 5),
      new MeshBasicMaterial({
        color: 0xffffff,
      }),
    );
    this.ground.receiveShadow = true;
    this.ground.rotateX(-PI12);
    Scene.scene.add(this.ground);
    this.sceneObjects.push(this.ground);
    // Loader.register([
    //   {
    //     name: 'char-sel-screen-back',
    //     path: bcmsMediaToUrl(this.sceneEntry.background),
    //     type: 'fbx',
    //   },
    // ]);
    // const loaderUnsub = Loader.onLoaded((item, data) => {
    //   if (item.name.startsWith('char-sel-screen-')) {
    //     const name = item.name.replace('char-sel-screen-', '');
    //     if (name === 'back') {
    //       const content = data as Object3D;
    //       content.traverse((t) => {
    //         // t.scale.addScalar(5);
    //         // t.position.x = -2;
    //         // t.position.z = 0.5;
    //         t.receiveShadow = true;
    //         t.castShadow = true;
    //         // t.rotateY(-0.2);
    //       });
    //       Scene.scene.add(content);
    //       this.sceneObjects.push(content);
    //       this.ground = content;
    //     }
    //   }
    // });
    // await Loader.run();
    // loaderUnsub();
  }

  private onResize() {
    this.camera.fov = this.fovFn(window.innerWidth / window.innerHeight);
  }

  private async createCamera() {
    const camOffset = {
      x: 0,
      z: 6,
      y: 3,
    };
    this.fovFn = FunctionBuilder.linear2D([
      [740 / 130, 10],
      [1920 / 1080, 50],
    ]);
    this.camera = new PerspectiveCamera(
      this.fovFn(window.innerWidth / window.innerHeight),
    );
    window.addEventListener('resize', this.onResize);
    this.camera.position.set(camOffset.x, camOffset.y, camOffset.z);
    this.camera.lookAt(0, 1.5, 0);
    Renderer.setCamera(this.camera);
  }

  private async createLights() {
    const ambLight = new AmbientLight(0xffffff, 0.4);
    this.sceneObjects.push(ambLight);
    Scene.scene.add(ambLight);
    const dirLight = new DirectionalLight(0xffffff, 1);
    const dirLightOffset = {
      x: -3,
      y: 10,
      z: 4,
    };
    dirLight.position.set(dirLightOffset.x, dirLightOffset.y, dirLightOffset.z);
    dirLight.lookAt(0, 0, 0);
    // const shadowSizeW = 4;
    // const shadowSizeH = 4;
    // const shadowRes = 1024;
    // dirLight.shadow.mapSize.width = shadowRes;
    // dirLight.shadow.mapSize.height = shadowRes;
    // dirLight.shadow.camera.left = -shadowSizeW;
    // dirLight.shadow.camera.right = shadowSizeW;
    // dirLight.shadow.camera.top = shadowSizeH;
    // dirLight.shadow.camera.bottom = -shadowSizeH;
    this.sceneObjects.push(dirLight);
    Scene.scene.add(dirLight);
    const help = new DirectionalLightHelper(dirLight);
    Scene.scene.add(help);
  }

  async changeCharacter(characterId: string): Promise<void> {
    this.player.destroy();
    this.player = await createPlayer({
      characterId,
      ground: this.ground,
      disableControls: true,
    });
  }

  async load(characterId?: string): Promise<void> {
    this.sceneEntry =
      (await BCMS.getEntryMeta<FadedCharacterSelectionScreenEntryMeta>({
        template: Config.charSelScreenTemp,
        entry: Config.charSelScreenEnt,
      })) as FadedCharacterSelectionScreenEntryMeta;
    if (!this.sceneEntry) {
      throw Error('Scene not found.');
    }
    await this.createCamera();
    await this.createLights();
    await this.loadAssets();
    if (characterId) {
      this.player = await createPlayer({
        characterId,
        ground: this.ground,
        disableControls: true,
      });
    }
  }

  async destroy() {
    Scene.scene.remove(...this.sceneObjects);
    window.removeEventListener('resize', this.onResize);
    this.player.destroy();
  }
}
