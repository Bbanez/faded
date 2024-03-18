import { invoke } from '@tauri-apps/api';
import { Settings } from '../types/rs';

export class SettingsHandler {
  static async get() {
    return await invoke<Settings>('settings_get', {
      resolution: [window.innerWidth, window.innerHeight],
    });
  }

  static async set(resolution: [number, number]) {
    return await invoke<Settings>('settings_set', {
      resolution,
    });
  }
}
