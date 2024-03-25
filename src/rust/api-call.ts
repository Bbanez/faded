import { invoke } from '@tauri-apps/api';
import type {
    Account,
    MapInfo,
    Player,
    Point,
    Settings,
    USize,
} from '../types/rs';

export function api_call<
    Data extends Record<string, unknown> | unknown = undefined,
    Result = unknown,
>(name: string) {
    return async (data: Data) => {
        return await invoke<Result>(name, data as never);
    };
}

export const rust_api_calls = {
    // Player API
    player_load: api_call<{ characterSlug: string; mapSlug: string }, Player>(
        'player_load',
    ),
    player_motion: api_call<{ motion: Point }, void>('player_motion'),
    player_get: api_call<void, Player | null>('player_get'),
    player_set_wanted_position: api_call<
        {
            wantedPosition: Point;
        },
        Player
    >('player_set_wanted_position'),

    // Account API
    account_create: api_call<{ username: string }, Account>('account_create'),
    account_load: api_call<{ username: string }, Account>('account_load'),
    account_get_active: api_call<void, Account | null>('account_get_active'),
    account_all: api_call<void, Account[]>('account_all'),

    // Settings API
    settings_get: api_call<{ resolution: USize }, Settings>('settings_get'),
    settings_set: api_call<{ resolution: USize }, Settings>('settings_set'),

    // Map info API
    map_info_set: api_call<{ pixels: number[]; mapSlug: string }, MapInfo>(
        'map_info_set',
    ),

    // Ticker API
    on_tick: api_call<void, void>('on_tick')
};
