import { api_call } from '@fdd/rust/api-call';
import { Game, GamePlayer, Point } from '@fdd/types/rs';
import { createArrayStore } from '@fdd/util/array-store';
import { QueueError, createQueue } from '@fdd/util/queue';

export class GameHandler {
    private rust = {
        get: api_call<{ gameId: string }, Game>('game_get'),
        getAll: api_call<void, Game[]>('game_get_all'),
        create: api_call<
            { mapId: string; accountId: string; hero1Id: string },
            Game
        >('game_create'),
        playerMove: api_call<
            { gameId: string; end: Point; playerIdx: number },
            GamePlayer
        >('game_player_move'),
        onTick: api_call<{ gameId: string }, Game>('game_on_tick'),
    };
    private latch: { [name: string]: boolean } = {};
    private queues = {
        getAll: createQueue<Game[]>(),
    };

    store = createArrayStore<Game>('id', []);

    async getAll() {
        const queue = await this.queues.getAll({
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

    async get(id: string) {
        const cacheHit = this.store.findById(id);
        if (cacheHit) {
            return cacheHit;
        }
        const result = await this.rust.get({
            gameId: id,
        });
        this.store.set(result);
        return result;
    }

    async create(accountId: string, hero1Id: string, mapId: string) {
        const result = await this.rust.create({
            mapId,
            accountId,
            hero1Id,
        });
        this.store.set(result);
        return result;
    }

    async playerMove(
        gameId: string,
        playerIdx: number,
        end: Point,
    ): Promise<GamePlayer> {
        return await this.rust.playerMove({
            gameId,
            end,
            playerIdx,
        });
    }

    async onTick(gameId: string): Promise<Game> {
        return await this.rust.onTick({
            gameId,
        });
    }
}
