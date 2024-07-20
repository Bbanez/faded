export class Chunk {
    id: number;
    meshId: number;
    setId: number;
    y: number;
    z: number;
    x: number;
    mirror: [number, number];
    rotation: number;

    constructor(
        chunk: number,
        public mapWidth: number,
        public mapDepth: number,
    ) {
        this.id = ChunkManipulation.getId(chunk, mapWidth, mapDepth);
        this.meshId = ChunkManipulation.getMeshId(chunk);
        this.setId = ChunkManipulation.getSetId(chunk);
        this.y = ChunkManipulation.getYPos(chunk);
        this.z = ChunkManipulation.getZPos(chunk);
        this.x = ChunkManipulation.getXPos(chunk);
        this.mirror = [
            ChunkManipulation.getXMirror(chunk),
            ChunkManipulation.getZMirror(chunk),
        ];
        this.rotation = ChunkManipulation.getRotation(chunk);
    }

    pack(): number {
        return ChunkManipulation.create(
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

export class ChunkManipulation {
    static create(
        mesh_id: number,
        set_id: number,
        x_pos: number,
        z_pos: number,
        y_pos: number,
        mirror: [number, number],
        rotation: number,
    ): number {
        let chunk: number = 0;
        chunk = this.setMeshId(chunk, mesh_id);
        chunk = this.setSetId(chunk, set_id);
        chunk = this.setXPos(chunk, x_pos);
        chunk = this.setZPos(chunk, z_pos);
        chunk = this.setYPos(chunk, y_pos);
        chunk = this.setXMirror(chunk, mirror[0]);
        chunk = this.setZMirror(chunk, mirror[1]);
        chunk = this.setRotation(chunk, rotation);
        return chunk;
    }

    static getId(chunk: number, mapWidth: number, mapDepth: number): number {
        const x = this.getXPos(chunk);
        const y = this.getYPos(chunk);
        const z = this.getZPos(chunk);
        return x + z * mapWidth + y * mapWidth * mapDepth;
    }

    static setMeshId(chunk: number, mesh_id: number): number {
        return (chunk & 0x3ffffff) | ((mesh_id & 0x3f) << 26);
    }
    static getMeshId(chunk: number): number {
        return (chunk & 0xfc000000) >> 26;
    }

    static setSetId(chunk: number, set_id: number): number {
        return (chunk & 0xfc3fffff) | ((set_id & 0xf) << 22);
    }
    static getSetId(chunk: number): number {
        return (chunk & 0x3c00000) >> 22;
    }

    static setYPos(chunk: number, y_pos: number): number {
        return (chunk & 0xffc3ffff) | ((y_pos & 0xf) << 18);
    }
    static getYPos(chunk: number): number {
        return (chunk & 0x3c0000) >> 18;
    }

    static setZPos(chunk: number, z_pos: number): number {
        return (chunk & 0xfffc07ff) | ((z_pos & 0x7f) << 11);
    }
    static getZPos(chunk: number): number {
        return (chunk & 0x3f800) >> 11;
    }

    static setXPos(chunk: number, x_pos: number): number {
        return (chunk & 0xfffff80f) | ((x_pos & 0x7f) << 4);
    }
    static getXPos(chunk: number): number {
        return (chunk & 0x7f0) >> 4;
    }

    static setZMirror(chunk: number, z_mirror: number): number {
        return (chunk & 0xfffffff7) | ((z_mirror & 0x1) << 3);
    }
    static getZMirror(chunk: number): number {
        return (chunk & 0x8) >> 3;
    }

    static setXMirror(chunk: number, x_mirror: number): number {
        return (chunk & 0xfffffffb) | ((x_mirror & 0x1) << 2);
    }
    static getXMirror(chunk: number): number {
        return (chunk & 0x4) >> 2;
    }

    static setRotation(chunk: number, rotation: number): number {
        return (chunk & 0xfffffffc) | (rotation & 0b11);
    }
    static getRotation(chunk: number): number {
        return chunk & 0x3;
    }
}

(window as any).chunk = Chunk;
