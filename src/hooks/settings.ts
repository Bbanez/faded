import { useQuery } from '../query.ts';
import { rust_api_calls } from '../rust/api-call.ts';

export function useSettings() {
    return useQuery('settings', async () => {
        return await rust_api_calls.settings_get({
            resolution: {
                width: window.innerWidth,
                height: window.innerHeight,
            },
        });
    });
}
