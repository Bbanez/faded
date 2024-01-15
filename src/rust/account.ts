import { invoke } from '@tauri-apps/api';
import { RustAccount } from '../types';
import { onMounted, ref } from 'vue';

export function useActiveAccount(): RustAccount | null {
  const activeAccount = ref<RustAccount | null>(null);
  onMounted(async () => {
    activeAccount.value = await AccountHandler.get_active();
  });
  return activeAccount.value;
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
