import {
    BufferGeometry,
    Color,
    DoubleSide,
    FrontSide,
    Group,
    Material,
    Mesh,
    MeshBasicMaterial,
    RepeatWrapping,
    Texture,
    Vector3,
} from 'three';
import { Sdk } from '@fdd/sdk';
import { AssetLoader, AssetLoaderItem } from '@fdd/util/asset-loader.ts';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import type { GameMap, GameMapLandscapeSet } from '@fdd/types/rs';
import { MapMakerGridPlane } from './grid-plane.ts';
import { MapMaker } from './main.ts';
import { ShaderManager } from '@fdd/shaders/manager.ts';

import vsh from '@fdd/shaders/landscape/demo.vert';
import fsh from '@fdd/shaders/landscape/demo.frag';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils';
import {
    rotateYGeometry,
    scaleGeometry,
    translateGeometry,
} from '@fdd/util/geometry.ts';
import { GameMapLandscapeChunk } from './chunk.ts';
import { Water, createWater } from '@fdd/game/water.ts';
import { PI12 } from '@fdd/util/math.ts';

export interface LandscapeMesh {
    setId: number;
    setName: string;
    meshId: number;
    meshName: string;
    data: Mesh;
}

export type LandscapeMeshes = Array<LandscapeMesh>;

export class Landscape {
    container: Group;
    mesh: Mesh;
    shader = new ShaderManager(
        vsh,
        fsh,
        {
            uGrassColor: new Color('#1f7a39'),
            uCliffColor: new Color('#aaaaaa'),
            uSandColor: new Color('#aa9900'),
            uSnowColor: new Color('#ffffff'),
            uGrassNoiseTexture: new Texture(),
            uGrassTexture: new Texture(),
            uMapSize: new Vector3(1, 1, 1),
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
        public gameMap: GameMap,
        public sets: GameMapLandscapeSet[],
        public meshes: LandscapeMeshes,
        grassNoiseTexture: Texture,
        grassTexture: Texture,
        public water: Water,
    ) {
        grassNoiseTexture.wrapS = RepeatWrapping;
        grassNoiseTexture.wrapT = RepeatWrapping;
        grassTexture.wrapS = RepeatWrapping;
        grassTexture.wrapT = RepeatWrapping;
        this.shader.setUniform('uGrassNoiseTexture', grassNoiseTexture);
        this.shader.setUniform('uGrassTexture', grassTexture);
        this.shader.setUniform(
            'uMapSize',
            new Vector3(
                this.gameMap.landscape.size.width,
                this.gameMap.landscape.size.height,
                this.gameMap.landscape.size.depth,
            ),
        );
        this.container = new Group();
        this.gridPlane = new MapMakerGridPlane(
            gameMap.landscape.size.width,
            gameMap.landscape.size.depth,
            gameMap.landscape.size.height,
            gameMap.landscape.selected_level,
        );
        this.mountedMashes = Array(this.gameMap.landscape.chunks.length).fill(
            undefined,
        );
        for (let i = 0; i < this.gameMap.landscape.chunks.length; i++) {
            const chunk = new GameMapLandscapeChunk(
                this.gameMap.landscape.chunks[i],
                gameMap.landscape.size.width,
                gameMap.landscape.size.depth,
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
        this.container.add(this.water.mesh);
    }

    setChunk(chunkBits: [number, number]) {
        const chunk = new GameMapLandscapeChunk(
            chunkBits,
            this.gameMap.landscape.size.width,
            this.gameMap.landscape.size.depth,
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
        this.gameMap.landscape.chunks[chunk.id] = chunkBits;
        const timeOffset = Date.now();
        this.sdk.gameMap
            .landscapeSetChunk(this.gameMap.id, chunkBits)
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
        this.water.destroy();
    }
}

export async function createLandscape(id: string, sdk: Sdk) {
    const sets = await sdk.gameMap.landscapeGetSets();
    const gameMap = await sdk.gameMap.get(id);
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
        {
            name: 'other-grass-noise-texture',
            type: 'texture',
            path: `/assets/maps/grass_noise.jpg`,
        },
        {
            name: 'other-grass-texture',
            type: 'texture',
            path: `/assets/maps/grass_texture.jpg`,
        },
    );
    let grassNoiseTexture: Texture = undefined as never;
    let grassTexture: Texture = undefined as never;
    const meshes: LandscapeMeshes = [];
    const loaderUnsub = AssetLoader.onLoaded(async (item, data) => {
        if (item.name.startsWith('other-')) {
            if (item.name === 'other-grass-noise-texture') {
                grassNoiseTexture = data as Texture;
            } else if (item.name === 'other-grass-texture') {
                grassTexture = data as Texture;
            }
        } else {
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
        }
    });
    await AssetLoader.run();
    loaderUnsub();
    const water = await createWater(
        gameMap.landscape.size.width,
        gameMap.landscape.size.depth,
        0.8,
    );
    return new Landscape(
        sdk,
        gameMap,
        sets,
        meshes,
        grassNoiseTexture,
        grassTexture,
        water,
    );
}
