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
import type { Landscape as RustLandscape, LandscapeSet } from '../types/rs';
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
import { Chunk64 } from './chunk-64.ts';

export interface LandscapeMesh {
    setId: number;
    setName: string;
    meshId: number;
    meshName: string;
    data: Mesh;
}

export type LandscapeMeshes = Array<LandscapeMesh>;

// export interface LandscapeMeshes {
//     [setId: string]: {
//         [name: string]: Mesh;
//     };
// }

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
            data.size.height,
            data.selected_level,
        );
        this.mountedMashes = Array(this.data.chunks.length).fill(undefined);
        for (let i = 0; i < this.data.chunks.length; i++) {
            const chunk = new Chunk64(
                this.data.chunks[i],
                data.size.width,
                data.size.depth,
            );
            const mesh = this.getChunkMesh(chunk.setId, chunk.meshId);
            mesh.position.set(chunk.x + 0.5, chunk.y, chunk.z + 0.5);
            const meshGeo = mesh.geometry.clone();
            scaleGeometry(meshGeo, [
                chunk.mirror[0] ? -1 : 1,
                1,
                chunk.mirror[1] ? -1 : 1,
            ]);
            rotateYGeometry(meshGeo, PI12 * chunk.rotation);
            translateGeometry(meshGeo, [chunk.x + 0.5, chunk.y, chunk.z + 0.5]);
            meshGeo.computeVertexNormals();
            meshGeo.computeBoundingBox();
            mesh.geometry = meshGeo;
            mesh.receiveShadow = true;
            this.mountedMashes[chunk.id] = {
                levelIdx: chunk.y,
                chunkIdx: chunk.id,
                mesh,
            };
        }
        const meshesFiltered = this.mountedMashes
            .filter((e) => e && e.mesh.name !== 'air')
            .map((e) => {
                return e.mesh.geometry;
            });
        const mergedGeo =
            meshesFiltered.length > 0
                ? mergeGeometries(meshesFiltered)
                : new BufferGeometry();
        this.mesh = new Mesh(mergedGeo, this.shader.material);
        this.mesh.receiveShadow = true;
        // this.mesh.castShadow = true;
        this.container.add(this.mesh);
    }

    setChunk(chunkBits: [number, number]) {
        const chunk = new Chunk64(
            chunkBits,
            this.data.size.width,
            this.data.size.depth,
        );
        const mesh = this.getChunkMesh(chunk.setId, chunk.meshId);
        mesh.position.set(chunk.x, chunk.y, chunk.z);
        mesh.rotateY(PI12 * chunk.rotation);
        const meshGeo = mesh.geometry.clone();
        scaleGeometry(meshGeo, [
            chunk.mirror[0] ? -1 : 1,
            1,
            chunk.mirror[1] ? -1 : 1,
        ]);
        rotateYGeometry(meshGeo, PI12 * chunk.rotation);
        translateGeometry(meshGeo, [chunk.x + 0.5, chunk.y, chunk.z + 0.5]);
        meshGeo.computeVertexNormals();
        meshGeo.computeBoundingBox();
        mesh.geometry = meshGeo;
        this.mountedMashes[chunk.id] = {
            levelIdx: chunk.y,
            mesh,
            chunkIdx: chunk.id,
        };
        const meshesFilterd = this.mountedMashes
            .filter((e) => e && e.mesh.name !== 'air')
            .map((e) => {
                return e.mesh.geometry;
            });
        const mergedGeo =
            meshesFilterd.length > 0
                ? mergeGeometries(meshesFilterd)
                : new BufferGeometry();
        this.container.remove(this.mesh);
        this.mesh = new Mesh(mergedGeo, this.shader.material);
        this.mesh.receiveShadow = true;
        this.container.add(this.mesh);
        this.data.chunks[chunk.id] = chunkBits;
        const timeOffset = Date.now();
        this.sdk.landscape
            .setChunk(
                this.data.id,
                chunkBits,
                this.data.size.width,
                this.data.size.depth,
            )
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

    getChunkMesh(setId: number, meshId: number): Mesh {
        if (meshId === 0) {
            const mesh = new Mesh(
                new BufferGeometry(),
                new MeshBasicMaterial({
                    color: '#000000',
                }),
            );
            mesh.name = 'air';
            return mesh;
        }
        for (let i = 0; i < this.meshes.length; i++) {
            const meshData = this.meshes[i];
            if (meshData.setId === setId && meshData.meshId === meshId) {
                return meshData.data.clone(true);
            }
        }
        throw Error(
            `Mesh for Set "${setId}" and Mesh "${meshId}" does not exists`,
        );
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
            const meshData = set.chunks[j];
            chunkNames[
                `${set.name}.${set.id}.${meshData.name}.${meshData.id}`
            ] = true;
        }
    }
    AssetLoader.register(
        ...Object.keys(chunkNames).map((itemName) => {
            const itemParts = itemName.split('.');
            const item: AssetLoaderItem = {
                name: itemName,
                type: 'gltf',
                path: `/assets/landscapes/${itemParts[0]}/${itemParts[2]}.glb`,
            };
            return item;
        }),
    );
    const meshes: LandscapeMeshes = [];
    const loaderUnsub = AssetLoader.onLoaded(async (item, data) => {
        const mesh = (data as GLTF).scene.children[0] as Mesh;
        mesh.castShadow = true;
        mesh.name = item.name;
        (mesh.material as Material).side = DoubleSide;
        mesh.position.set(0, 0, 0);
        scaleGeometry(mesh.geometry, [0.5, 0.5, 0.5]);
        const [setName, setId, meshName, meshId] = item.name.split('.');
        meshes.push({
            setName,
            setId: parseInt(setId),
            meshName,
            meshId: parseInt(meshId),
            data: mesh,
        });
    });
    await AssetLoader.run();
    loaderUnsub();
    return new Landscape(sdk, landscape, sets, meshes, width, height);
}
