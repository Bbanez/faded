import { api_call } from '../../rust/api-call.ts';
import {
    Landscape,
    LandscapeChunk,
    LandscapeSet,
    Point3,
    USize3,
} from '../../types/rs';
import { createQueue } from '@banez/queue';
import { createArrayStore } from '@banez/vue-array-store';
import { QueueError } from '@banez/queue/types';

export class LandscapeHandler {
    private rust_landscape_create = api_call<
        { name: string; desc: string; size: USize3 },
        Landscape
    >('landscape_create');
    private rust_landscape_update = api_call<
        { landscape: Landscape },
        Landscape
    >('landscape_update');
    private rust_landscape_set_chunk = api_call<
        {
            id: string;
            levelIdx: number;
            chunkIdx: number;
            chunk: LandscapeChunk;
        },
        LandscapeChunk
    >('landscape_set_chunk');
    private rust_landscape_save = api_call<void, Landscape[]>('landscape_save');
    private rust_landscape_get = api_call<{ id: string }, Landscape>(
        'landscape_get',
    );
    private rust_landscape_get_all = api_call<void, Landscape[]>(
        'landscape_get_all',
    );
    private rust_landscape_get_set_chunks = api_call<
        { setId: string },
        LandscapeChunk[]
    >('landscape_get_set_chunks');
    private rust_landscape_get_sets = api_call<void, LandscapeSet[]>(
        'landscape_get_sets',
    );
    private rust_landscape_set_camera = api_call<
        { id: string; position: Point3; rotation: number; distance: number, speed: number },
        Point3
    >('landscape_set_camera');
    private rust_landscape_set_selected_level = api_call<
        { id: string; level: number },
        number
    >('landscape_set_selected_level');

    private getAllQueue = createQueue<Landscape[]>();
    private latch: {
        [name: string]: boolean;
    } = {};

    store = createArrayStore<Landscape>('id', []);

    async create(name: string, desc: string, size: USize3) {
        const result = await this.rust_landscape_create({ name, desc, size });
        this.store.set(result);
        return result;
    }

    async setChunk(
        id: string,
        levelIdx: number,
        chunkIdx: number,
        chunk: LandscapeChunk,
    ) {
        const result = await this.rust_landscape_set_chunk({
            id,
            chunk,
            chunkIdx,
            levelIdx,
        });
        const landscape = this.store.findById(id);
        if (landscape) {
            landscape.levels[levelIdx].chunks[chunkIdx] = chunk;
        }
        return result;
    }

    async setCamera(
        id: string,
        position: Point3,
        rotation: number,
        distance: number,
        speed: number,
    ) {
        const result = await this.rust_landscape_set_camera({
            id,
            position,
            rotation,
            distance,
            speed,
        });
        const landscape = this.store.findById(id);
        if (landscape) {
            landscape.updated_at = BigInt(Date.now());
            landscape.camera_position = position;
            landscape.camera_rotation = rotation;
            landscape.camera_d = distance;
            landscape.camera_speed = speed;
        }
        return result;
    }

    async setSelectedLevel(id: string, level: number) {
        const result = await this.rust_landscape_set_selected_level({
            id,
            level,
        });
        const landscape = this.store.findById(id);
        if (landscape) {
            landscape.updated_at = BigInt(Date.now());
            landscape.selected_level = level;
        }
        return result;
    }

    async update(landscape: Landscape) {
        const result = await this.rust_landscape_update({ landscape });
        this.store.set(result);
        return result;
    }

    async save() {
        const result = await this.rust_landscape_save();
        this.store.set(result);
        return result;
    }

    async get(id: string, skipCache?: boolean) {
        if (!skipCache) {
            const cacheHit = this.store.findById(id);
            if (cacheHit) {
                return cacheHit;
            }
        }
        const result = await this.rust_landscape_get({ id });
        this.store.set(result);
        return result;
    }

    async getAll(skipCache?: boolean) {
        const queue = await this.getAllQueue({
            name: 'getAll',
            handler: async () => {
                if (!skipCache && this.latch.all) {
                    return this.store.items();
                }
                const result = await this.rust_landscape_get_all();
                this.store.set(result);
                return result;
            },
        }).wait;
        if (queue instanceof QueueError) {
            throw queue.error;
        }
        return queue.data;
    }

    async getSetChunks(setId: string) {
        return await this.rust_landscape_get_set_chunks({ setId });
    }

    async getSets() {
        return await this.rust_landscape_get_sets();
    }
}
