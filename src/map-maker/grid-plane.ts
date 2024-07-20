import {
    FrontSide,
    Mesh,
    MeshBasicMaterial,
    PlaneGeometry,
    Raycaster,
    Vector2,
} from 'three';
import { ShaderManager } from '../game/shaders/manager.ts';
import gridPlaneVsh from '../game/shaders/map-maker/grid-plane.vert';
import gridPlaneFsh from '../game/shaders/map-maker/grid-plane.frag';
import { PI12 } from '../game/consts.ts';
import { callAndClearUnsubscribeFns, UnsubscribeFns } from '../util/sub.ts';
import { Mouse, MouseEventType, MouseState } from '../game/mouse.ts';
import { FunctionBuilder, Linear2DFn } from '../game/math/function-builder.ts';
import { MapMaker } from './main.ts';
import { Keyboard, KeyboardEventType } from '../game/keyboard.ts';
import { ChunkManipulation } from './chunk.ts';

export class MapMakerGridPlane {
    mesh: Mesh;
    rotation = 0;
    level = 0;
    mirror: [number, number] = [1, 1];
    shader = new ShaderManager(
        gridPlaneVsh,
        gridPlaneFsh,
        {
            uCursor: new Vector2(0, 0),
            uSize: new Vector2(1, 1),
            uStepSize: new Vector2(1, 1),
            uActiveCell: new Vector2(0, 0),
        },
        {
            transparent: true,
            side: FrontSide,
        },
    );
    activeCell: [number, number] = [0, 0];
    previewChunkMesh: Mesh;

    private maker: MapMaker | null = null;
    private unsubs: UnsubscribeFns = [];
    private ray = new Raycaster();
    private worldToShaderTransform: {
        x: Linear2DFn;
        z: Linear2DFn;
    };
    private previewChunkIdx = 0;
    private previewSetIdx = 0;

    constructor(
        public width: number,
        public depth: number,
        public height: number,
        selectedLevel: number,
    ) {
        this.level = selectedLevel;
        this.worldToShaderTransform = {
            x: FunctionBuilder.linear2D([
                [0, 0],
                [width, 1],
            ]),
            z: FunctionBuilder.linear2D([
                [0, 0],
                [depth, 1],
            ]),
        };
        this.mesh = new Mesh(
            new PlaneGeometry(width, depth),
            this.shader.material,
        );
        this.mesh.rotateX(-PI12);
        this.mesh.position.set(width / 2, this.level + 0.1, depth / 2);
        this.shader.setUniform('uSize', new Vector2(width, depth));
        this.shader.setUniform(
            'uStepSize',
            new Vector2(
                this.worldToShaderTransform.x(1),
                this.worldToShaderTransform.z(1),
            ),
        );
        this.previewChunkMesh = new Mesh(
            new PlaneGeometry(1, 1),
            new MeshBasicMaterial({
                color: '#00ffff',
            }),
        );
        this.previewChunkMesh.rotateX(-PI12);
    }

    initialize(maker: MapMaker) {
        this.maker = maker;
        this.maker.scene.add(this.mesh);
        // Initialize preview mesh
        {
            const set = this.maker.landscape.sets[this.previewSetIdx];
            const meshData = set.chunks[this.previewChunkIdx];
            this.setPreviewChunkMesh(set.id, meshData.id);
        }
        this.unsubs.push(
            Mouse.subscribe(MouseEventType.MOUSE_MOVE, (state) => {
                const inter = this.getIntersectionWithGrid(state);
                if (inter[0]) {
                    this.activeCell = this.getCell(
                        inter[0].point.x,
                        inter[0].point.z,
                    );
                    const activeCellTransformed = this.transformXZ(
                        ...this.activeCell,
                    );
                    this.shader.setUniform(
                        'uCursor',
                        new Vector2(
                            ...this.transformXZ(
                                inter[0].point.x,
                                inter[0].point.z,
                            ),
                        ),
                    );
                    this.shader.setUniform(
                        'uActiveCell',
                        new Vector2(
                            activeCellTransformed[0],
                            activeCellTransformed[1],
                        ),
                    );
                    this.previewChunkMesh.position.set(
                        this.activeCell[0] + 0.5,
                        this.level,
                        this.activeCell[1] + 0.5,
                    );
                }
            }),
            Mouse.subscribe(MouseEventType.MOUSE_DOWN, (state) => {
                if (state.left) {
                    if (!this.maker) {
                        return;
                    }
                    const inter = this.getIntersectionWithGrid(state);
                    if (inter[0]) {
                        const setId = this.maker.landscape.sets[0].id;
                        const chunkData =
                            this.maker.landscape.sets[0].chunks[
                                this.previewChunkIdx
                            ];
                        maker.landscape.setChunk(
                            ChunkManipulation.create(
                                chunkData.id,
                                setId,
                                this.activeCell[0],
                                this.activeCell[1],
                                this.level,
                                [this.mirror[0], this.mirror[1]],
                                this.rotation,
                            ),
                            //     {
                            //     mesh: chunkData.name,
                            //     set_id: setId,
                            //     set_name: setName,
                            //     id: matToVecIndex(
                            //         this.activeCell[0],
                            //         this.activeCell[1],
                            //         maker.landscape.data.size.width,
                            //     ),
                            //     position: {
                            //         x: this.activeCell[0],
                            //         y: this.level,
                            //         z: this.activeCell[1],
                            //     },
                            //     mirror: [...this.mirror],
                            //     rotation: this.rotation,
                            // }
                        );
                        this.activeCell = this.getCell(
                            inter[0].point.x,
                            inter[0].point.z,
                        );
                    }
                }
            }),
            Keyboard.subscribe(KeyboardEventType.KEY_DOWN, (state) => {
                if (state.r) {
                    const set = maker.landscape.sets[this.previewSetIdx];
                    const meshData = set.chunks[this.previewChunkIdx];
                    if (state.shift) {
                        this.rotation = (this.rotation - 1) % 4;
                    } else {
                        this.rotation = (this.rotation + 1) % 4;
                    }
                    this.setPreviewChunkMesh(set.id, meshData.id);
                }
                if (state.q) {
                    if (state.shift) {
                        this.previewChunkIdx =
                            (this.previewChunkIdx - 1) %
                            maker.landscape.sets[this.previewSetIdx].chunks
                                .length;
                    } else {
                        this.previewChunkIdx =
                            (this.previewChunkIdx + 1) %
                            maker.landscape.sets[this.previewSetIdx].chunks
                                .length;
                    }
                    const set = maker.landscape.sets[this.previewSetIdx];
                    const meshData = set.chunks[this.previewChunkIdx];
                    this.setPreviewChunkMesh(set.id, meshData.id);
                }
                if (state.x) {
                    const set = maker.landscape.sets[this.previewSetIdx];
                    const meshData = set.chunks[this.previewChunkIdx];
                    this.mirror[0] *= -1;
                    this.setPreviewChunkMesh(set.id, meshData.id);
                }
                if (state.z) {
                    const set = maker.landscape.sets[this.previewSetIdx];
                    const meshData = set.chunks[this.previewChunkIdx];
                    this.mirror[1] *= -1;
                    this.setPreviewChunkMesh(set.id, meshData.id);
                }
                if (state['>'] || state['<']) {
                    if (!this.maker) {
                        return;
                    }
                    // const data = this.maker.landscape.data;
                    const set = maker.landscape.sets[this.previewSetIdx];
                    const meshData = set.chunks[this.previewChunkIdx];
                    if (state['>']) {
                        this.level++;
                    } else if (state['<']) {
                        this.level--;
                    }
                    if (this.level > this.height) {
                        this.level--;
                    } else if (this.level < 0) {
                        this.level = 0;
                    }
                    // if (!data.levels[this.level]) {
                    //     data.levels[this.level] = {
                    //         chunks: [],
                    //     };
                    // }
                    this.setPreviewChunkMesh(set.id, meshData.id);
                    this.mesh.position.set(
                        this.maker.landscape.data.size.width / 2,
                        this.level + 0.1,
                        this.maker.landscape.data.size.depth / 2,
                    );
                    this.maker.camera.followPoint.y = this.level;
                    this.maker.sdk.landscape
                        .setSelectedLevel(
                            this.maker.landscape.data.id,
                            this.level,
                        )
                        .catch((err) => {
                            console.error(err);
                        });
                    // this.maker.camera.update();
                }
            }),
        );
    }

    private setPreviewChunkMesh(setId: number, meshId: number) {
        if (!this.maker) {
            return;
        }
        this.maker?.scene.remove(this.previewChunkMesh);
        this.previewChunkMesh = this.maker.landscape.getChunkMesh(
            setId,
            meshId,
        );
        this.previewChunkMesh.scale.x *= this.mirror[0];
        this.previewChunkMesh.scale.z *= this.mirror[1];
        this.previewChunkMesh.rotateY(PI12 * this.rotation);
        this.previewChunkMesh.position.set(
            this.activeCell[0] + 0.5,
            this.level,
            this.activeCell[1] + 0.5,
        );
        this.maker?.scene.add(this.previewChunkMesh);
    }

    getIntersectionWithGrid(state: MouseState) {
        if (!this.maker) {
            throw Error('Map maker is not initializes');
        }
        const pointer = {
            x: state.x,
            y: state.y,
        };
        pointer.x = (state.x / window.innerWidth) * 2 - 1;
        pointer.y = -(state.y / window.innerHeight) * 2 + 1;
        this.ray.setFromCamera(
            new Vector2(pointer.x, pointer.y),
            this.maker.camera.cam,
        );
        return this.ray.intersectObject(this.mesh);
    }

    getCell(x: number, z: number): [number, number] {
        const xCell = parseInt(`${x}`);
        const zCell = parseInt(`${z}`);
        return [xCell, zCell];
    }

    transformXZ(x: number, z: number): [number, number] {
        return [
            this.worldToShaderTransform.x(x),
            this.worldToShaderTransform.z(z),
        ];
    }

    destroy() {
        callAndClearUnsubscribeFns(this.unsubs);
    }
}
