import { ShaderManager } from '@fdd/shaders/manager';
import fsh from '@fdd/shaders/water.frag';
import vsh from '@fdd/shaders/water.vert';
import { Mesh, PlaneGeometry, RepeatWrapping, Texture } from 'three';
import { PI12 } from '@fdd/util/math';
import { AssetLoader } from '@fdd/util/asset-loader';
import { UnsubscribeFns, callAndClearUnsubscribeFns } from '@fdd/util/sub';
import { Ticker } from '@fdd/util/ticker';

export class Water {
    shader = new ShaderManager<{
        normalTexture: Texture;
        uMillis: number;
    }>(
        vsh,
        fsh,
        {
            normalTexture: new Texture(),
            uMillis: 0,
        },
        {
            transparent: true,
        },
    );
    mesh: Mesh;

    private unsubs: UnsubscribeFns = [];

    constructor(
        width: number,
        depth: number,
        height: number,
        waterNormalTexture: Texture,
    ) {
        waterNormalTexture.wrapS = RepeatWrapping;
        waterNormalTexture.wrapT = RepeatWrapping;
        const plane = new PlaneGeometry(width, depth);
        plane.rotateX(-PI12);
        let cTime = 0;
        this.unsubs.push(
            Ticker.subscribe(async (_, dt) => {
                cTime += dt;
                this.shader.setUniform('uMillis', cTime);
            }),
        );
        this.shader.setUniform('normalTexture', waterNormalTexture);
        this.mesh = new Mesh(plane, this.shader.material);
        this.mesh.receiveShadow = true;
        this.mesh.position.set(width / 2, height, depth / 2);
    }

    destroy() {
        callAndClearUnsubscribeFns(this.unsubs);
    }
}

export async function createWater(
    width: number,
    depth: number,
    height: number,
) {
    AssetLoader.register({
        name: 'water-normals',
        path: [`/assets/maps/water_normals.jpeg`],
        type: 'texture',
    });
    let waterNormalTexture: Texture = null as never;
    const loaderUnsub = AssetLoader.onLoaded(async (item, data) => {
        if (item.name === 'water-normals') {
            waterNormalTexture = data as Texture;
        }
    });
    await AssetLoader.run();
    loaderUnsub();
    return new Water(width, depth, height, waterNormalTexture);
}
