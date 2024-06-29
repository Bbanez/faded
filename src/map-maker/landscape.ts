import {
    BufferGeometry,
    Color,
    DoubleSide,
    FrontSide,
    Group,
    Material,
    Mesh,
    MeshBasicMaterial,
} from 'three';
import { Sdk } from '../sdk/main.ts';
import { AssetLoader, AssetLoaderItem } from '../game/asset-loader.ts';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import type {
    Landscape as RustLandscape,
    LandscapeChunk,
    LandscapeSet,
} from '../types/rs';
import { MapMakerGridPlane } from './grid-plane.ts';
import { MapMaker } from './main.ts';
import { ShaderManager } from '../game/shaders/manager.ts';

import vsh from '../game/shaders/map-maker/landscape.vert';
import fsh from '../game/shaders/map-maker/landscape.frag';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils';
import { PI12 } from '../game/consts.ts';
import {
    rotateYGeometry,
    scaleGeometry,
    translateGeometry,
} from '../game/util/geometry.ts';

export interface LandscapeMeshes {
    [setId: string]: {
        [name: string]: Mesh;
    };
}

export class Landscape {
    container: Group;
    mesh: Mesh;
    shader = new ShaderManager(
        vsh,
        fsh,
        {
            uGrassColor: new Color('#00ff00'),
            uCliffColor: new Color('#aaaaaa'),
            uSandColor: new Color('#aa9900'),
            uSnowColor: new Color('#ffffff'),
        },
        {
            lights: true,
            side: FrontSide,
        },
    );

    mountedMashes: Array<{
        levelIdx: number;
        chunkIdx: number;
        mesh: Mesh;
    }> = [];
    gridPlane: MapMakerGridPlane;

    constructor(
        private sdk: Sdk,
        public data: RustLandscape,
        public sets: LandscapeSet[],
        public meshes: LandscapeMeshes,
        public width: number,
        public height: number,
    ) {
        this.container = new Group();
        this.gridPlane = new MapMakerGridPlane(
            data.size.width,
            data.size.depth,
            data.selected_level,
        );
        for (let i = 0; i < this.data.levels.length; i++) {
            const level = this.data.levels[i];
            for (let j = 0; j < level.chunks.length; j++) {
                const chunk = level.chunks[j];
                const mesh = this.getChunkMesh(chunk.set_name, chunk.mesh);
                if (mesh.name === 'air') {
                    continue;
                }
                mesh.position.set(
                    chunk.position.x + 0.5,
                    chunk.position.y,
                    chunk.position.z + 0.5,
                );
                const meshGeo = mesh.geometry.clone();
                scaleGeometry(meshGeo, [chunk.mirror[0], 1, chunk.mirror[1]]);
                rotateYGeometry(meshGeo, PI12 * chunk.rotation);
                translateGeometry(meshGeo, [
                    chunk.position.x + 0.5,
                    chunk.position.y,
                    chunk.position.z + 0.5,
                ]);
                meshGeo.computeVertexNormals();
                meshGeo.computeBoundingBox();
                mesh.geometry = meshGeo;
                mesh.receiveShadow = true;
                this.mountedMashes.push({
                    levelIdx: i,
                    chunkIdx: chunk.id,
                    mesh,
                });
            }
        }
        const mergedGeo =
            this.mountedMashes.length > 0
                ? mergeGeometries(
                      this.mountedMashes.map((e) => e.mesh.geometry),
                  )
                : new BufferGeometry();
        this.mesh = new Mesh(mergedGeo, this.shader.material);
        this.mesh.receiveShadow = true;
        // this.mesh.castShadow = true;
        this.container.add(this.mesh);
    }

    setChunk(chunk: LandscapeChunk) {
        const mesh = this.getChunkMesh(chunk.set_name, chunk.mesh);
        mesh.position.set(chunk.position.x, chunk.position.y, chunk.position.z);
        mesh.rotateY(PI12 * chunk.rotation);
        const meshGeo = mesh.geometry.clone();
        scaleGeometry(meshGeo, [chunk.mirror[0], 1, chunk.mirror[1]]);
        rotateYGeometry(meshGeo, PI12 * chunk.rotation);
        translateGeometry(meshGeo, [
            chunk.position.x + 0.5,
            chunk.position.y,
            chunk.position.z + 0.5,
        ]);
        meshGeo.computeVertexNormals();
        meshGeo.computeBoundingBox();
        mesh.geometry = meshGeo;
        const existingMeshIdx = this.mountedMashes.findIndex(
            (e) => e.levelIdx === chunk.position.y && e.chunkIdx === chunk.id,
        );
        if (existingMeshIdx !== -1) {
            console.log('Here');
            this.mountedMashes[existingMeshIdx] = {
                levelIdx: chunk.position.y,
                mesh,
                chunkIdx: chunk.id,
            };
            console.log(this.mountedMashes[existingMeshIdx]);
        } else {
            this.mountedMashes.push({
                levelIdx: chunk.position.y,
                mesh,
                chunkIdx: chunk.id,
            });
        }
        const mergedGeo = mergeGeometries(
            this.mountedMashes
                .filter((e) => e.mesh.name !== 'air')
                .map((e) => e.mesh.geometry),
        );
        this.container.remove(this.mesh);
        this.mesh = new Mesh(mergedGeo, this.shader.material);
        this.mesh.receiveShadow = true;
        this.container.add(this.mesh);
        this.data.levels[chunk.position.y].chunks[chunk.id] = chunk;
        const timeOffset = Date.now();
        this.sdk.landscape
            .setChunk(this.data.id, chunk.position.y, chunk.id, chunk)
            .then(() => {
                console.log('t1', Date.now() - timeOffset);
            })
            .catch((err) => {
                console.error(err);
            });
    }

    initialize(maker: MapMaker) {
        this.gridPlane.initialize(maker);
    }

    getChunkMesh(setName: string, meshName: string): Mesh {
        if (meshName === 'air') {
            const mesh = new Mesh(
                new BufferGeometry(),
                new MeshBasicMaterial({
                    color: '#000000',
                }),
            );
            mesh.name = 'air';
            return mesh;
        }
        console.log({setName, meshName})
        return this.meshes[setName][meshName].clone(true);
    }

    destroy() {
        this.gridPlane.destroy();
    }
}

export async function createLandscape(
    id: string,
    sdk: Sdk,
    width: number,
    height: number,
) {
    const sets = await sdk.landscape.getSets();
    const landscape = await sdk.landscape.get(id);
    const chunkNames: {
        [name: string]: boolean;
    } = {};
    for (let i = 0; i < sets.length; i++) {
        const set = sets[i];
        for (let j = 0; j < set.chunks.length; j++) {
            const chunk = set.chunks[j];
            chunkNames[`${set.name}.${chunk.name}`] = true;
        }
    }
    AssetLoader.register(
        ...Object.keys(chunkNames).map((chunkName) => {
            const [setName, modelName] = chunkName.split('.');
            const item: AssetLoaderItem = {
                name: chunkName,
                type: 'gltf',
                path: `/assets/landscapes/${setName}/${modelName}.glb`,
            };
            return item;
        }),
    );
    const meshes: LandscapeMeshes = {};
    const loaderUnsub = AssetLoader.onLoaded(async (item, data) => {
        const mesh = (data as GLTF).scene.children[0] as Mesh;
        mesh.castShadow = true;
        mesh.name = item.name;
        (mesh.material as Material).side = DoubleSide;
        mesh.position.set(0, 0, 0);
        scaleGeometry(mesh.geometry, [0.5, 0.5, 0.5]);
        const [setName, modelName] = item.name.split('.');
        if (!meshes[setName]) {
            meshes[setName] = {};
        }
        meshes[setName][modelName] = mesh;
    });
    console.log({meshes})
    await AssetLoader.run();
    loaderUnsub();
    return new Landscape(sdk, landscape, sets, meshes, width, height);
}
