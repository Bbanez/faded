import { Sdk, useSdk } from '@fdd/sdk/main.ts';
import { FPS } from '@fdd/util/fps.ts';
import { AxesHelper, CubeTexture, Scene } from 'three';
import { MapMakerCamera } from './camera.ts';
import { Ticker } from '@fdd/util/ticker.ts';
import { callAndClearUnsubscribeFns, UnsubscribeFns } from '@fdd/util/sub.ts';
import { MapMakerRenderer } from './renderer.ts';
import { createLandscape, Landscape } from './landscape.ts';
import { MapMakerLights } from './lights.ts';
import { AssetLoader } from '@fdd/util/asset-loader.ts';
import { Mouse } from '@fdd/user-input/mouse.ts';
import { Keyboard } from '@fdd/user-input/keyboard.ts';

export class MapMaker {
    public fps: FPS = new FPS();
    public scene: Scene = new Scene();
    public camera: MapMakerCamera;
    public renderer: MapMakerRenderer;
    public lights: MapMakerLights;

    private unsub: UnsubscribeFns = [];
    private runTicker = true;

    constructor(
        public el: HTMLElement,
        public sdk: Sdk,
        public landscape: Landscape,
        public skybox: CubeTexture,
    ) {
        this.lights = new MapMakerLights(this);
        this.scene.background = skybox;
        this.camera = new MapMakerCamera(
            this,
            this.landscape.gameMap.landscape.camera_speed,
            [
                this.landscape.gameMap.landscape.camera_position.x,
                this.landscape.gameMap.landscape.camera_position.y,
                this.landscape.gameMap.landscape.camera_position.z,
            ],
            this.landscape.gameMap.landscape.camera_rotation,
            this.landscape.gameMap.landscape.camera_d,
        );
        this.renderer = new MapMakerRenderer(
            this.el,
            this.scene,
            this.camera.cam,
        );
        Mouse.init();
        Keyboard.init();
        Ticker.reset();
        this.renderer.loadPostProcessing();
        this.frameTick().catch((err) => console.error(err));
        this.scene.add(new AxesHelper(100));
        this.scene.add(this.landscape.container);
        this.scene.add(this.lights.sun);
        this.scene.add(this.lights.ambientLight);
    }

    private async frameTick() {
        await Ticker.tick();
        if (this.runTicker) {
            requestAnimationFrame(async () => {
                await this.frameTick();
            });
        }
    }

    destroy() {
        this.runTicker = false;
        callAndClearUnsubscribeFns(this.unsub);
        Mouse.destroy();
        Keyboard.destroy();
        Ticker.clear();
        this.renderer.destroy();
        this.scene.clear();
        this.fps.destroy();
        this.lights.destroy();
        if (this.landscape) {
            this.landscape.destroy();
        }
    }
}

export async function createMapMaker(el: HTMLElement, landscapeId: string) {
    const sdk = useSdk();
    const landscape = await createLandscape(landscapeId, sdk);
    AssetLoader.register({
        name: 'skybox',
        path: [
            `/assets/landscapes/demo/skybox/xn.png`,
            `/assets/landscapes/demo/skybox/xp.png`,
            `/assets/landscapes/demo/skybox/yp.png`,
            `/assets/landscapes/demo/skybox/yn.png`,
            `/assets/landscapes/demo/skybox/zp.png`,
            `/assets/landscapes/demo/skybox/zn.png`,
        ],
        type: 'cubeTexture',
    });
    let skybox: CubeTexture = null as never;
    const loaderUnsub = AssetLoader.onLoaded(async (item, data) => {
        if (item.name === 'skybox') {
            skybox = data as CubeTexture;
        }
    });
    await AssetLoader.run();
    loaderUnsub();
    const maker = new MapMaker(el, sdk, landscape, skybox);
    landscape.initialize(maker);
    return maker;
}
