import vsh from '@fdd/shaders/landscape/demo.vert';
import fsh from '@fdd/shaders/landscape/demo.frag';

import { GameManager } from './main';
import { ShaderManager } from '@fdd/shaders/manager';
import {
    BufferGeometry,
    Color,
    FrontSide,
    Mesh,
    MeshBasicMaterial,
    Texture,
    Vector3,
} from 'three';
import { GameMapLandscapeChunk } from '@fdd/map-maker/chunk';
import {
    rotateYGeometry,
    scaleGeometry,
    translateGeometry,
} from '@fdd/util/geometry';
import { PI12 } from '@fdd/util/math';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils';
import { Water, createWater } from './water';

export interface LandscapeShaderUniforms {
    uGrassColor: Color;
    uCliffColor: Color;
    uSandColor: Color;
    uSnowColor: Color;
    uGrassNoiseTexture: Texture;
    uGrassTexture: Texture;
    uMapSize: Vector3;
}

export interface LandscapeChunkMesh {
    setId: number;
    setName: string;
    meshId: number;
    meshName: string;
    data: Mesh;
}

export class Landscape {
    shader: ShaderManager<LandscapeShaderUniforms>;
    groundMesh: Mesh = null as never;
    water: Water | null = null;

    constructor(
        private gameManager: GameManager,
        shaderUniforms: LandscapeShaderUniforms,
    ) {
        this.shader = new ShaderManager(vsh, fsh, shaderUniforms, {
            lights: true,
            side: FrontSide,
        });
    }

    private getChunkMesh(
        chunkMeshes: LandscapeChunkMesh[],
        setId: number,
        meshId: number,
    ): Mesh {
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
        for (let i = 0; i < chunkMeshes.length; i++) {
            const meshData = chunkMeshes[i];
            if (meshData.setId === setId && meshData.meshId === meshId) {
                return meshData.data.clone(true);
            }
        }
        console.warn({ chunkMeshes });
        throw Error(
            `Mesh for Set "${setId}" and Mesh "${meshId}" does not exists`,
        );
    }

    async initialize(chunkMeshes: LandscapeChunkMesh[]) {
        const displayableChunks: BufferGeometry[] = [];
        for (
            let i = 0;
            i < this.gameManager.gameMap.landscape.chunks.length;
            i++
        ) {
            const chunk = new GameMapLandscapeChunk(
                this.gameManager.gameMap.landscape.chunks[i],
                this.gameManager.gameMap.landscape.size.width,
                this.gameManager.gameMap.landscape.size.depth,
            );
            if (chunk.meshId === 0) {
                continue;
            }
            const mesh = this.getChunkMesh(
                chunkMeshes,
                chunk.setId,
                chunk.meshId,
            );
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
            displayableChunks.push(meshGeo);
        }
        this.groundMesh = new Mesh(
            mergeGeometries(displayableChunks),
            this.shader.material,
        );
        this.groundMesh.receiveShadow = true;
        this.water = await createWater(
            this.gameManager.gameMap.landscape.size.width,
            this.gameManager.gameMap.landscape.size.depth,
            0.8,
        );
    }

    destroy() {
        this.water?.destroy();
    }
}
