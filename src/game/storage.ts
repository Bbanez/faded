import { invoke } from '@tauri-apps/api';

export type StorageKeys = 'player' | 'enemy' | 'accounts';

export class Storage {
  static async get<T = string>(key: StorageKeys): Promise<T | null> {
    const res = await invoke<string>('storage_get', { key });
    try {
      const o = JSON.parse(res);
      return o;
    } catch (error) {
      return res as T;
    }
  }

  static async set<T = string>(key: StorageKeys, value: T): Promise<void> {
    const v = typeof value === 'object' ? JSON.stringify(value) : value + '';
    await invoke('storage_set', { key, value: v });
  }
}
