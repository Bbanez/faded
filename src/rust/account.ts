import { invoke } from '@tauri-apps/api';
import { RustAccount } from '../types';
import { onMounted, ref } from 'vue';
import { useQuery, UseQueryArgsOnLoad } from '../query.ts';

export function useActiveAccount(onLoaded?: UseQueryArgsOnLoad<RustAccount>) {
  return useQuery({
    fetch: async () => {
      return await AccountHandler.get_active();
    },
    onLoaded,
  });
}

export function useAccounts(): RustAccount[] {
  const accounts = ref<RustAccount[]>([]);
  onMounted(async () => {
    accounts.value = await AccountHandler.all();
  });
  return accounts.value;
}

export class AccountHandler {
  static async create(username: string): Promise<RustAccount> {
    return await invoke('account_create', { username });
  }

  static async load(username: string): Promise<RustAccount | null> {
    return await invoke('account_load', { username });
  }

  static async get_active(): Promise<RustAccount | null> {
    return await invoke('account_get_active');
  }

  static async all(): Promise<RustAccount[]> {
    return await invoke('account_all');
  }
}
