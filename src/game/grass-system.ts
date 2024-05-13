import grassFrag from './shaders/grass.frag';
import grassVert from './shaders/grass.vert';

import { Game } from './main.ts';
import {
    BoxGeometry,
    BufferGeometry,
    DataUtils,
    DoubleSide,
    Float16BufferAttribute,
    Float32BufferAttribute,
    Group,
    InstancedBufferAttribute,
    InstancedBufferGeometry,
    Mesh,
    Sphere,
    Uint8BufferAttribute,
    Vector2,
    Vector3,
    Vector4,
} from 'three';
import { MathUtil } from './math/random.ts';
import { callAndClearUnsubscribeFns, UnsubscribeFns } from '../util/sub.ts';
import { ShaderManager } from './shaders/manager.ts';
import { PI12 } from './consts.ts';

const GRASS_STEP = 0.05;
const GRASS_AREA_OFFSET = 1;
const GRASS_RAND_OFFSET = 0.05;
const GRASS_COUNT = parseInt(`${GRASS_AREA_OFFSET / GRASS_STEP}`);

class InstancedFloat16BufferAttribute extends InstancedBufferAttribute {
    constructor(
        array: number[],
        itemSize: number,
        normalized?: boolean,
        meshPerAttribute = 1,
    ) {
        super(new Uint16Array(array), itemSize, normalized, meshPerAttribute);
        (this as any).isFloat16BufferAttribute = true;
    }
}

class GrassPatch {
    shader: ShaderManager<{
        uMillis: number;
        uHash: number;
        uGrassSize: Vector2;
        uGrassParams: Vector4;
    }>;
    geo: InstancedBufferGeometry;
    mesh: Mesh;

    constructor(
        baseMesh: Mesh,
        public patchSize: number,
        bladeCount: number,
        terrainHeight: number,
        terrainOffset: number,
    ) {
        console.log(baseMesh.geometry);
        this.shader = new ShaderManager(
            grassVert,
            grassFrag,
            true,
            DoubleSide,
            {
                uMillis: 0,
                uHash: MathUtil.getRandomFloat(-0.2, 0.2),
                uGrassSize: new Vector2(0.2, 1.2),
                uGrassParams: new Vector4(6, 14, terrainHeight, terrainOffset),
            },
        );
        this.geo = new InstancedBufferGeometry();
        const singleBladeVertPosition: number[] = [];
        const vertOffsetX = MathUtil.getRandomFloat(-0.2, 0.2);
        const vertOffsetY = 0.05;
        for (let i = 0; i < 6; i++) {
            singleBladeVertPosition.push(0, vertOffsetY * i, 0);
            singleBladeVertPosition.push(vertOffsetX, vertOffsetY * i, 0);
            singleBladeVertPosition.push(0, vertOffsetY + vertOffsetY * i, 0);

            singleBladeVertPosition.push(0, vertOffsetY + vertOffsetY * i, 0);
            singleBladeVertPosition.push(vertOffsetX, vertOffsetY * i, 0);
            singleBladeVertPosition.push(
                vertOffsetX,
                vertOffsetY + vertOffsetY * i,
                0,
            );
        }
        const bladeInstanceOffset: number[] = [];
        const bladeInstanceRotation: number[] = [];
        const tempVec = new Vector4();
        for (let i = 0; i < bladeCount; i++) {
            bladeInstanceOffset.push(
                MathUtil.getRandomFloat(-patchSize * 0.5, patchSize * 0.5),
                0,
                MathUtil.getRandomFloat(-patchSize * 0.5, patchSize * 0.5),
            );
            tempVec.set(
                Math.random() * 2 - 1,
                Math.random() * 2 - 1,
                Math.random() * 2 - 1,
                Math.random() * 2 - 1,
            );
            tempVec.normalize();

            bladeInstanceRotation.push(
                tempVec.x,
                tempVec.y,
                tempVec.z,
                tempVec.w,
            );
        }
        this.geo.instanceCount = bladeCount;
        this.geo.setAttribute(
            'position',
            new Float32BufferAttribute(singleBladeVertPosition, 3),
        );
        this.geo.setAttribute(
            'offset',
            new InstancedBufferAttribute(
                new Float32Array(bladeInstanceOffset),
                3,
            ),
        );
        this.geo.setAttribute(
            'orientation',
            new InstancedBufferAttribute(
                new Float32Array(bladeInstanceOffset),
                4,
            ),
        );
        this.mesh = new Mesh(this.geo, this.shader.material);
        this.mesh.receiveShadow = true;
        this.mesh.castShadow = true;
        this.mesh.visible = true;
    }

    destroy() {
        this.geo.clearGroups();
    }
}

export class GrassSystem {
    private unsubs: UnsubscribeFns = [];
    private patches: GrassPatch[] = [];

    container: Group = new Group();

    constructor(private game: Game) {
        // this.patches.push(
        //     new GrassPatch(
        //         game.assets.grass.children[0] as Mesh,
        //         1,
        //         100,
        //         this.game.player.assets.t.position.y,
        //         0,
        //     ),
        // );
        // this.patches[0].mesh.position.set(
        //     this.game.player.assets.t.position.x,
        //     this.game.player.assets.t.position.y,
        //     this.game.player.assets.t.position.z,
        // );
        // this.container.add(this.patches[0].mesh);
        this.game.scene.add(this.container);
    }

    // constructor(private game: Game) {
    //     for (let x = -GRASS_COUNT; x < GRASS_COUNT; x++) {
    //         for (let z = -GRASS_COUNT; z < GRASS_COUNT; z++) {
    //             const grass = this.game.assets.grass.clone();
    //             const mesh = grass.children[0] as Mesh;
    //             mesh.material = new ShaderMaterial({
    //                 uniforms: UniformsUtils.merge([
    //                     UniformsLib['lights'],
    //                     {
    //                         uMillis: {
    //                             value: 0,
    //                         },
    //                         uHash: {
    //                             value: MathUtil.getRandomFloat(-0.2, 0.2),
    //                         },
    //                     },
    //                 ]),
    //                 fragmentShader: grassFrag,
    //                 vertexShader: grassVert,
    //                 lights: true,
    //             });
    //             const grassX =
    //                 this.game.player.assets.t.position.x +
    //                 x * GRASS_STEP +
    //                 MathUtil.getRandomFloat(
    //                     -GRASS_RAND_OFFSET,
    //                     GRASS_RAND_OFFSET,
    //                 );
    //             const grassZ =
    //                 this.game.player.assets.t.position.z +
    //                 z * GRASS_STEP +
    //                 MathUtil.getRandomFloat(
    //                     -GRASS_RAND_OFFSET,
    //                     GRASS_RAND_OFFSET,
    //                 );
    //             // const grassY = Distance.heightTo(
    //             //     {
    //             //         x: grassX,
    //             //         y: grassZ,
    //             //     },
    //             //     this.game.assets.ground,
    //             // );
    //             const grassY = this.game.player.assets.t.position.y;
    //             const scale = 0.1;
    //             grass.rotation.y = MathUtil.getRandomFloat(-Math.PI, Math.PI);
    //             grass.scale.set(scale, 0.1, scale);
    //             grass.position.set(grassX, grassY, grassZ);
    //             this.container.add(grass);
    //         }
    //     }
    //     this.game.scene.add(this.container);
    //     this.unsubs.push(
    //         Ticker.subscribe(async () => {
    //             for (let i = 0; i < this.container.children.length; i++) {
    //                 const grass = this.container.children[i] as Group;
    //                 const mesh = grass.children[0] as Mesh;
    //                 const material = mesh.material as ShaderMaterial;
    //                 material.uniforms.uMillis.value = Date.now();
    //             }
    //         }),
    //     );
    // }

    destroy() {
        callAndClearUnsubscribeFns(this.unsubs);
        this.patches.forEach((e) => e.destroy());
    }
}
