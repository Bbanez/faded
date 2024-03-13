import { useQuery } from '../query';
import { SettingsGet } from '../../wailsjs/go/game/Api';

export function useSettings() {
    return useQuery('settings', async () => {
        return await SettingsGet({
            width: window.innerWidth,
        });
    });
}
