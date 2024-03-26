import { UseQuery, useQuery } from '../query.ts';
import { rust_api_calls } from '../rust/api-call.ts';
import { Player } from '../types/rs';

export function usePlayer() {
    const query: UseQuery<Player> = useQuery<Player>('player', async () => {
        const data = rust_api_calls.player_get();
        if (!query.data || !data) {
            return data
        }
        if (JSON.stringify(data) !== JSON.stringify(query.data)) {
            return data
        } else {
            return query.data.value
        }
    });
    return query
}
