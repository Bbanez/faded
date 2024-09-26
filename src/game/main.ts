import { Game, GameMap } from '@fdd/types/rs';
import {
    Color,
    CubeTexture,
    DoubleSide,
    Group,
    Material,
    Mesh,
    Scene,
    Texture,
    Vector3,
} from 'three';
import { Camera } from './camera';
import { Renderer } from './renderer';
import { Ticker } from '@fdd/util/ticker';
import { Sdk } from '@fdd/sdk';
import { AssetLoader, AssetLoaderItem } from '@fdd/util/asset-loader';
import { Lights } from './lights';
import { Mouse } from '@fdd/user-input/mouse';
import { Keyboard } from '@fdd/user-input/keyboard';
import { Landscape, LandscapeChunkMesh } from './landscape';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { scaleGeometry } from '@fdd/util/geometry';
import { Player, PlayerAssets } from './player';
import { UnsubscribeFns } from '@fdd/util/sub.ts';

export class GameManager {
    scene: Scene;
    renderer: Renderer;
    camera: Camera;
    lights: Lights;
    landscape: Landscape;
    players: Player[] = [];

    private unsubs: UnsubscribeFns = [];

    constructor(
        public sdk: Sdk,
        public htmlContainer: HTMLElement,
        public game: Game,
        public gameMap: GameMap,
        private frameTicker: boolean,
        private navMesh: number[],
    ) {
        this.scene = new Scene();
        // this.scene.fog = new Fog(0x000000, 1, 5);
        this.camera = new Camera(this, gameMap.hero_start_position);
        this.renderer = new Renderer(
            this,
            this.htmlContainer,
            this.scene,
            this.camera.cam,
        );
        this.renderer.loadPostProcessing();
        this.renderer.onResize();
        this.lights = new Lights(this);
        this.landscape = new Landscape(this, {
            uGrassColor: new Color('#1f7a39'),
            uCliffColor: new Color('#aaaaaa'),
            uSandColor: new Color('#aa9900'),
            uSnowColor: new Color('#ffffff'),
            uGrassNoiseTexture: new Texture(),
            uGrassTexture: new Texture(),
            uMapSize: new Vector3(
                this.gameMap.landscape.size.width,
                this.gameMap.landscape.size.height,
                this.gameMap.landscape.size.depth,
            ),
            uNavMesh: this.navMeshToTexture(this.navMesh),
        });
        Mouse.init();
        Keyboard.init();
        Ticker.reset();
        if (this.frameTicker) {
            this.frameTick().catch((err) => console.error(err));
        }
    }

    private navMeshToTexture(navMesh: number[]): Texture {
        const pixelData: number[] = [];
        for (let i = 0; i < navMesh.length; i++) {
            const item = navMesh[i] * 255;
            if (item > 0) {
                pixelData.push(255, 0, 0, 255);
            } else {
                pixelData.push(0, 0, 255, 255);
            }
        }
        const pixelArr = new Uint8ClampedArray(pixelData);
        const imageData = new ImageData(
            pixelArr,
            this.gameMap.landscape.size.width,
            this.gameMap.landscape.size.depth,
        );
        return new Texture(imageData);
    }

    private async frameTick() {
        await Ticker.tick();
        if (this.frameTicker) {
            requestAnimationFrame(async () => {
                await this.frameTick();
            });
        }
    }

    async initialize() {
        await this.sdk.settings.get({
            width: window.innerWidth,
            height: window.innerHeight,
        });
        const landscapeChunkSets = await this.sdk.gameMap.landscapeGetSets();
        const landscapeChunkNames: {
            [name: string]: boolean;
        } = {};
        for (let i = 0; i < landscapeChunkSets.length; i++) {
            const set = landscapeChunkSets[i];
            for (let j = 0; j < set.chunks.length; j++) {
                const meshData = set.chunks[j];
                landscapeChunkNames[
                    `${set.name}.${set.id}.${meshData.name}.${meshData.id}`
                ] = true;
            }
        }
        AssetLoader.register(
            ...Object.keys(landscapeChunkNames).map((itemName) => {
                const itemParts = itemName.split('.');
                const item: AssetLoaderItem = {
                    name: itemName,
                    type: 'gltf',
                    path: `/assets/landscapes/${itemParts[0]}/${itemParts[2]}.glb`,
                };
                return item;
            }),
            {
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
            },
            {
                name: 'landscape-grass-noise-texture',
                type: 'texture',
                path: `/assets/maps/grass_noise.jpg`,
            },
            {
                name: 'landscape-grass-texture',
                type: 'texture',
                path: `/assets/maps/grass_texture.jpg`,
            },
        );
        for (let i = 0; i < this.game.players.length; i++) {
            const player = this.game.players[i];
            AssetLoader.register(
                {
                    name: `p_${i}:` + player.hero.id + ':t',
                    path: `/assets/heros/${player.hero.id}/t.fbx`,
                    type: 'fbx',
                },
                {
                    name: `p_${i}:` + player.hero.id + ':idle',
                    path: `/assets/heros/${player.hero.id}/idle.fbx`,
                    type: 'fbx',
                },
                {
                    name: `p_${i}:` + player.hero.id + ':run',
                    path: `/assets/heros/${player.hero.id}/run.fbx`,
                    type: 'fbx',
                },
                {
                    name: `p_${i}:` + player.hero.id + ':death',
                    path: `/assets/heros/${player.hero.id}/death.fbx`,
                    type: 'fbx',
                },
            );
        }
        const landscapeChunkMeshes: LandscapeChunkMesh[] = [];
        const playersAssets: PlayerAssets[] = [];
        for (let i = 0; i < this.game.players.length; i++) {
            playersAssets.push({} as never);
        }
        const loaderUnsub = AssetLoader.onLoaded(async (item, data) => {
            if (item.name === 'skybox') {
                this.scene.background = data as CubeTexture;
            } else if (item.name.startsWith('landscape-')) {
                if (item.name === 'landscape-grass-noise-texture') {
                    this.landscape.shader.setUniform(
                        'uGrassNoiseTexture',
                        data as Texture,
                    );
                } else if (item.name === 'landscape-grass-texture') {
                    this.landscape.shader.setUniform(
                        'uGrassTexture',
                        data as Texture,
                    );
                }
            } else if (item.name.startsWith('p_')) {
                const parts = item.name.split(':');
                const playerIdx = parseInt(parts[0].split('_')[1]);
                playersAssets[playerIdx][parts[2] as keyof PlayerAssets] =
                    data as Group;
                // if (parts[0] === 'p_1') {
                //     player1Assets[parts[2] as keyof PlayerAssets] =
                //         data as Group;
                // }
            } else {
                const mesh = (data as GLTF).scene.children[0] as Mesh;
                mesh.castShadow = true;
                mesh.name = item.name;
                (mesh.material as Material).side = DoubleSide;
                mesh.position.set(0, 0, 0);
                scaleGeometry(mesh.geometry, [0.5, 0.5, 0.5]);
                const [setName, setId, meshName, meshId] = item.name.split('.');
                landscapeChunkMeshes.push({
                    setName,
                    setId: parseInt(setId),
                    meshName,
                    meshId: parseInt(meshId),
                    data: mesh,
                });
            }
        });
        await AssetLoader.run();
        loaderUnsub();
        await this.landscape.initialize(landscapeChunkMeshes);
        this.scene.add(this.landscape.groundMesh);
        if (this.landscape.water) {
            this.scene.add(this.landscape.water.mesh);
        }
        for (let i = 0; i < this.game.players.length; i++) {
            this.players.push(
                new Player(
                    this.sdk,
                    this,
                    this.game.players[i],
                    playersAssets[i],
                    i,
                ),
            );
        }
        this.camera.follow(this.players[0].assets.t.position);
        this.scene.add(this.players[0].assets.t);
    }

    destroy() {
        Ticker.clear();
        this.lights.destroy();
        this.scene.clear();
        this.renderer.destroy();
        this.htmlContainer.innerHTML = '';
        this.camera.destroy();
        Mouse.destroy();
        Keyboard.destroy();
        Ticker.clear();
        this.frameTicker = false;
        this.landscape.destroy();
    }
}
