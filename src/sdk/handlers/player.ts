import type { Player, Point } from '../../types/rs';
import { api_call } from '../../rust/api-call.ts';
import { Sdk } from '../main.ts';

export class PlayerHandler {
    private rust_motion = api_call<{ motion: Point }, void>('player_motion');
    private rust_get = api_call<void, Player>('player_get');
    private rust_set_wanted_position = api_call<
        {
            wantedPosition: Point;
        },
        Player
    >('player_set_wanted_position');

    constructor(private sdk: Sdk) {}

    async set_wanted_position(position: Point) {
        const player = await this.rust_set_wanted_position({
            wantedPosition: position,
        });
        if (this.sdk.manager.store.items()[0]) {
            this.sdk.manager.store.items()[0].player = player;
        }
        return player;
    }

    async get() {
        const player = await this.rust_get();
        if (this.sdk.manager.store.items()[0]) {
            this.sdk.manager.store.items()[0].player = player;
        }
        return player;
    }

    async set_motion(motion: Point) {
        await this.rust_motion({ motion });
    }
}
