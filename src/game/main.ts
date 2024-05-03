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
import { Renderer } from './renderer';
import { Mouse } from './mouse';
import { Keyboard } from './keyboard';
import { Ticker } from './ticker';
import { AssetLoader } from './asset-loader';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { PI12 } from './consts';
import { Camera } from './camera';
import { Player, createPlayer } from './player';
import { Character, Manager, Map } from '../types/rs';
import { api_call } from '../rust/api-call.ts';
import { useSdk } from '../sdk/main.ts';

export interface GameConfig {
    el: HTMLElement;
    frameTicker: boolean;
    mapId: string;
    characterId: string;
    manager: Manager;
}

export class GameAssets {
    ground: Group = null as never;
    skybox: CubeTexture = null as never;
    grad: Texture = null as never;
    cursorMove: Texture = null as never;
}

export class Game {
    id = uuidv4();
    scene: Scene;
    renderer: Renderer;
    camera: Camera;
    fps: number = 0;
    player: Player = null as never;
    fpsEl = document.createElement('div');

    private unsubs: Array<() => void> = [];

    constructor(
        public el: HTMLElement,
        private frameTicker: boolean,
        public manager: Manager,
        public map: Map,
        public character: Character,
        public assets: GameAssets,
    ) {
        this.scene = new Scene();
        this.scene.background = new Color(0, 0, 0);
        this.camera = new Camera(this, [50, 50]);
        this.renderer = new Renderer(this.el, this.scene, this.camera.cam);
        Mouse.init();
        Keyboard.init();
        this.fpsEl.setAttribute(
            'style',
            'text-size: 12px; position: fixed; right: 0; top: 0; padding: 5px 12px; z-index: 1000; background-color: rgba(0, 0, 0, 0.3); color: white;',
        );
        setInterval(() => {
            this.fpsEl.innerText = this.fps + '';
            this.fps = 0;
        }, 1000);

        Ticker.reset();
        const rustOnTick = api_call<void, void>('on_tick');
        this.unsubs.push(
            Ticker.subscribe(async () => {
                this.fps++;
                await rustOnTick();
            }),
        );
        if (this.frameTicker) {
            this.frameTick().catch((err) => console.error(err));
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
        this.renderer.postProcessingShader.uniforms.tGrad.value =
            this.assets.grad;
        await this.renderer.loadPostProcessing();
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
                        this.player.assets.t.position.x,
                        this.player.assets.t.position.y,
                        this.player.assets.t.position.z,
                    );
                }
            }),
        );
        const ambientLight = new AmbientLight(0xffffff, 1.5);
        this.scene.add(ambientLight);

        const water = new Mesh(
            new PlaneGeometry(this.map.width, this.map.height),
            new MeshBasicMaterial({
                color: 0x00aaff,
                transparent: true,
                opacity: 0.5,
            }),
        );
        water.rotation.x = -PI12;
        water.position.set(this.map.width / 2, -0.2, this.map.height / 2);
        this.scene.add(water);
        this.renderer.onResize();

        this.player = await createPlayer(this, this.manager, this.character);
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

export async function createGame(config: GameConfig): Promise<Game> {
    const sdk = useSdk();
    const map = (await sdk.data.maps()).find((e) => e.id === config.mapId);
    if (!map) {
        throw Error(`Map "${config.mapId}" does not exist`);
    }
    const character = (await sdk.data.characters()).find(
        (e) => e.id === config.characterId,
    );
    if (!character) {
        throw Error(`Character "${config.characterId}" does not exist`);
    }
    console.log({ map, character });
    const gameAssets = new GameAssets();
    AssetLoader.register(
        {
            name: 'ground',
            path: `/assets/maps/${map.id}/model.gltf`,
            type: 'gltf',
        },
        {
            name: 'skybox',
            path: [
                `/assets/maps/${map.id}/skybox/xn.png`,
                `/assets/maps/${map.id}/skybox/xp.png`,
                `/assets/maps/${map.id}/skybox/yp.png`,
                `/assets/maps/${map.id}/skybox/yn.png`,
                `/assets/maps/${map.id}/skybox/zp.png`,
                `/assets/maps/${map.id}/skybox/zn.png`,
            ],
            type: 'cubeTexture',
        },
        {
            name: 'grad',
            path: '/grad.png',
            type: 'texture',
        },
        {
            name: 'cursorMove',
            path: '/cursor-move.png',
            type: 'texture',
        },
    );
    const loaderUnsub = AssetLoader.onLoaded(async (item, data) => {
        if (item.name === 'ground') {
            gameAssets.ground = (data as GLTF).scene;
            gameAssets.ground.traverse((o) => {
                o.receiveShadow = true;
                // o.castShadow = true;
            });
            gameAssets.ground.scale.set(map.width / 2, 50, map.height / 2);
        } else if (item.name === 'skybox') {
            gameAssets.skybox = data as CubeTexture;
        } else if (item.name === 'grad') {
            gameAssets.grad = data as Texture;
        } else if (item.name === 'cursorMove') {
            gameAssets.cursorMove = data as Texture;
        }
    });
    await AssetLoader.run();
    loaderUnsub();
    return new Game(
        config.el,
        config.frameTicker,
        config.manager,
        map,
        character,
        gameAssets,
    );
}
