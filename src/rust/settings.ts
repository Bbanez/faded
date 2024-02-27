import { invoke } from '@tauri-apps/api';
import { RustSettings } from '../types/rust/settings.ts';

export class SettingsHandler {
  static async get() {
    return await invoke<RustSettings>('settings_get', {
      resolution: [window.innerWidth, window.innerHeight],
    });
  }

  static async set(resolution: [number, number]) {
    const res = await invoke<RustSettings>('settings_set', {
      resolution,
    });
    return res;
  }
}
