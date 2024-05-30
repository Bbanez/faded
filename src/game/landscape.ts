import demoVert from './shaders/maps/demo/ground.vert';
import demoFrag from './shaders/maps/demo/ground.frag';

import {
    Color,
    CubeTexture,
    FrontSide,
    Group,
    Mesh,
    Vector2,
    Vector3,
} from 'three';
import { ShaderManager } from './shaders/manager.ts';
import { AssetLoader } from './asset-loader.ts';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { useSdk } from '../sdk/main.ts';
import { MapExtended } from '../sdk/handlers/data.ts';
import { callAndClearUnsubscribeFns, UnsubscribeFns } from '../util/sub.ts';
import { Ticker } from './ticker.ts';

const shadersByMap: {
    [name: string]: {
        vsh: string;
        fsh: string;
    };
} = {
    demo: {
        vsh: demoVert,
        fsh: demoFrag,
    },
};

export class Landscape {
    public shader: ShaderManager<{
        uTime: number;
        uScreen: Vector2;
        uBaseColor: Color;
        uMapSize: Vector3;
    }>;

    private timeOffset = Date.now();
    private unsubs: UnsubscribeFns = [];

    constructor(
        public map: MapExtended,
        public group: Group,
        public skybox: CubeTexture,
    ) {
        const sdk = useSdk();
        const settings = sdk.settings.store.value;
        if (!settings) {
            throw Error('Landscape: Settings not loaded');
        }
        this.group.scale.set(map.width / 2, 50, map.height / 2);
        this.group.traverse((g) => {
            g.receiveShadow = true;
        });
        this.shader = new ShaderManager(
            shadersByMap[map.id].vsh,
            shadersByMap[map.id].fsh,
            true,
            FrontSide,
            {
                uTime: 0,
                uScreen: new Vector2(
                    settings.resolution.width,
                    settings.resolution.height,
                ),
                uBaseColor: new Color('#68554e'),
                uMapSize: this.group.scale,
            },
        );
        const mesh = this.group.children[0] as Mesh;
        mesh.material = this.shader.material;
        // (group as any).children[0].material.onBeforeCompile = (shader: any) => {
        //     console.log('FSH', shader.fragmentShader);
        //     console.log('VSH', shader.vertexShader);
        // };
        window.addEventListener('resize', this.onResize);
        this.unsubs.push(
            Ticker.subscribe(async () => {
                this.shader.setUniform('uTime', Date.now() - this.timeOffset);
            }),
            () => {
                window.removeEventListener('resize', this.onResize);
            },
        );
    }

    onResize() {
        const sdk = useSdk();
        const settings = sdk.settings.store.value;
        if (settings) {
            this.shader.setUniform(
                'uScreen',
                new Vector2(window.innerWidth, window.innerHeight),
            );
        }
    }

    destroy() {
        callAndClearUnsubscribeFns(this.unsubs);
    }
}

export async function createLandscape(mapId: string): Promise<Landscape> {
    const sdk = useSdk();
    const map = (await sdk.data.maps()).find((e) => e.id === mapId);
    if (!map) {
        throw Error(`Map "${mapId}" does not exist`);
    }
    AssetLoader.register(
        {
            name: 'land',
            path: `/assets/maps/${mapId}/model.gltf`,
            type: 'gltf',
        },
        {
            name: 'skybox',
            path: [
                `/assets/maps/${mapId}/skybox/xn.png`,
                `/assets/maps/${mapId}/skybox/xp.png`,
                `/assets/maps/${mapId}/skybox/yp.png`,
                `/assets/maps/${mapId}/skybox/yn.png`,
                `/assets/maps/${mapId}/skybox/zp.png`,
                `/assets/maps/${mapId}/skybox/zn.png`,
            ],
            type: 'cubeTexture',
        },
    );
    let land: Group = null as never;
    let skybox: CubeTexture = null as never;
    const loaderUnsub = AssetLoader.onLoaded(async (item, data) => {
        if (item.name === 'land') {
            land = (data as GLTF).scene;
            land.receiveShadow = true;
        } else if (item.name === 'skybox') {
            skybox = data as CubeTexture;
        }
    });
    await AssetLoader.run();
    loaderUnsub();
    return new Landscape(map, land, skybox);
}
