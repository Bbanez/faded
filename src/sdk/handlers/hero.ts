import { api_call } from '@fdd/rust/api-call';
import { Hero } from '@fdd/types/rs';
import { createArrayStore } from '@fdd/util/array-store';
import { QueueError, createQueue } from '@fdd/util/queue';

export class HeroHandler {
    private rust = {
        get: api_call<{ id: string }, Hero>('hero_get'),
        getAll: api_call<void, Hero[]>('hero_get_all'),
    };
    private latch: {
        [name: string]: boolean;
    } = {};
    private queues = {
        all: createQueue<Hero[]>(),
    };

    store = createArrayStore<Hero>('id', []);

    async get(id: string) {
        const cacheHit = this.store.findById(id);
        if (cacheHit) {
            return cacheHit;
        }
        const result = await this.rust.get({ id });
        this.store.set(result);
        return result;
    }

    async getAll() {
        const queue = await this.queues.all({
            name: 'getAll',
            handler: async () => {
                if (this.latch.all) {
                    return this.store.items();
                }
                const result = await this.rust.getAll();
                this.store.set(result);
                this.latch.all = true;
                return result;
            },
        }).wait;
        if (queue instanceof QueueError) {
            throw queue.error;
        }
        return queue.data;
    }
}
