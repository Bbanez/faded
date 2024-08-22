import { Game, GameMap } from '@fdd/types/rs';
import {
    Color,
    CubeTexture,
    DoubleSide,
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

export class GameManager {
    scene: Scene;
    renderer: Renderer;
    camera: Camera;
    lights: Lights;
    landscape: Landscape;

    constructor(
        public sdk: Sdk,
        public htmlContainer: HTMLElement,
        public game: Game,
        public gameMap: GameMap,
        private frameTicker: boolean,
    ) {
        this.scene = new Scene();
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
        });
        Mouse.init();
        Keyboard.init();
        Ticker.reset();
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
        const landscapeChunkMeshes: LandscapeChunkMesh[] = [];
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
    }

    desctroy() {
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
