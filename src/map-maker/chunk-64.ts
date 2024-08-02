export type Chunk64Mirror = [0 | 1, 0 | 1];

export class Chunk64 {
    id: number;
    meshId: number;
    setId: number;
    y: number;
    z: number;
    x: number;
    mirror: Chunk64Mirror;
    rotation: number;

    constructor(
        chunk: [number, number],
        public mapWidth: number,
        public mapDepth: number,
    ) {
        this.id = ChunkManipulation64.getId(chunk, mapWidth, mapDepth);
        this.meshId = ChunkManipulation64.getMeshId(chunk);
        this.setId = ChunkManipulation64.getSetId(chunk);
        this.y = ChunkManipulation64.getYPos(chunk);
        this.z = ChunkManipulation64.getZPos(chunk);
        this.x = ChunkManipulation64.getXPos(chunk);
        this.mirror = [
            ChunkManipulation64.getXMirror(chunk),
            ChunkManipulation64.getZMirror(chunk),
        ];
        this.rotation = ChunkManipulation64.getRotation(chunk);
    }

    pack(): [number, number] {
        return ChunkManipulation64.create(
            this.meshId,
            this.setId,
            this.x,
            this.z,
            this.y,
            this.mirror,
            this.rotation,
        );
    }
}

export class ChunkManipulation64 {
    static create(
        mesh_id: number,
        set_id: number,
        x_pos: number,
        z_pos: number,
        y_pos: number,
        mirror: [number, number],
        rotation: number,
    ): [number, number] {
        const chunk: [number, number] = [0, 0];
        this.setMeshId(chunk, mesh_id);
        this.setSetId(chunk, set_id);
        this.setXPos(chunk, x_pos);
        this.setZPos(chunk, z_pos);
        this.setYPos(chunk, y_pos);
        this.setXMirror(chunk, mirror[0]);
        this.setZMirror(chunk, mirror[1]);
        this.setRotation(chunk, rotation);
        return chunk;
    }

    static getId(
        chunk: [number, number],
        map_width: number,
        map_depth: number,
    ): number {
        const x = this.getXPos(chunk);
        const y = this.getYPos(chunk);
        const z = this.getZPos(chunk);
        return x + z * map_width + y * map_width * map_depth;
    }

    static setMeshId(chunk: [number, number], mesh_id: number) {
        chunk[0] = (chunk[0] & 0xfff003ff) | ((mesh_id & 0x3ff) << 10);
    }
    static getMeshId(chunk: [number, number]): number {
        return (chunk[0] & 0xffc00) >> 10;
    }

    static setSetId(chunk: [number, number], set_id: number) {
        chunk[1] = (chunk[1] & 0xffffff) | ((set_id & 0xff) << 24);
    }
    static getSetId(chunk: [number, number]): number {
        return (chunk[1] & 0xff000000) >> 24;
    }

    static setYPos(chunk: [number, number], y_pos: number) {
        chunk[0] = (chunk[0] & 0xfffffc00) | (y_pos & 0x3ff);
    }
    static getYPos(chunk: [number, number]): number {
        return chunk[0] & 0x3ff;
    }

    static setZPos(chunk: [number, number], z_pos: number) {
        chunk[1] = (chunk[1] & 0xff003fff) | ((z_pos & 0x3ff) << 14);
    }
    static getZPos(chunk: [number, number]): number {
        return (chunk[1] & 0xffc000) >> 14;
    }

    static setXPos(chunk: [number, number], x_pos: number) {
        chunk[1] = (chunk[1] & 0xfffffc0f) | ((x_pos & 0x3ff) << 4);
    }
    static getXPos(chunk: [number, number]): number {
        return (chunk[1] & 0x7f0) >> 4;
    }

    static setZMirror(chunk: [number, number], z_mirror: 0 | 1) {
        chunk[1] = (chunk[1] & 0xfffffff7) | ((z_mirror & 0x1) << 3);
    }
    static getZMirror(chunk: [number, number]): number {
        return (chunk[1] & 0x8) >> 3;
    }

    static setXMirror(chunk: [number, number], x_mirror: 0 | 1) {
        chunk[1] = (chunk[1] & 0xfffffffb) | ((x_mirror & 0x1) << 2);
    }
    static getXMirror(chunk: [number, number]): number {
        return (chunk[1] & 0x4) >> 2;
    }

    static setRotation(chunk: [number, number], rotation: number) {
        chunk[1] = (chunk[1] & 0xfffffffc) | (rotation & 0b11);
    }
    static getRotation(chunk: [number, number]): number {
        return chunk[1] & 0x3;
    }
}
