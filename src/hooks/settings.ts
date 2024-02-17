import { useQuery } from '../query.ts';
import { SettingsHandler } from '../rust/settings.ts';

export function useSettings() {
  return useQuery('settings', async () => {
    return await SettingsHandler.get();
  });
}
