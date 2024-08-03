import { Sdk, useSdk } from '../sdk/main.ts';
import { FPS } from '../game/fps.ts';
import { AxesHelper, CubeTexture, Scene } from 'three';
import { MapMakerCamera } from './camera.ts';
import { Mouse } from '../game/mouse.ts';
import { Keyboard } from '../game/keyboard.ts';
import { Ticker } from '../game/ticker.ts';
import { callAndClearUnsubscribeFns, UnsubscribeFns } from '../util/sub.ts';
import { MapMakerRenderer } from './renderer.ts';
import { createLandscape, Landscape } from './landscape.ts';
import { MapMakerLights } from './lights.ts';
import { AssetLoader } from '../game/asset-loader.ts';

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
            this.landscape.data.camera_speed,
            [
                this.landscape.data.camera_position.x,
                this.landscape.data.camera_position.y,
                this.landscape.data.camera_position.z,
            ],
            this.landscape.data.camera_rotation,
            this.landscape.data.camera_d,
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
        // this.scene.add(this.lights.sun);
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
