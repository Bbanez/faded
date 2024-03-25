import { useQuery } from '../query.ts';
import { rust_api_calls } from '../rust/api-call.ts';

export function usePlayer() {
    return useQuery('player', async () => {
        return rust_api_calls.player_get();
    });
}
