import { invoke } from '@tauri-apps/api';
import { onMounted, ref } from 'vue';
import type { Account } from '../types/rs';

export function useAccounts(): Account[] {
    const accounts = ref<Account[]>([]);
    onMounted(async () => {
        accounts.value = await AccountHandler.all();
    });
    return accounts.value;
}

export class AccountHandler {
    static async create(username: string): Promise<Account> {
        return await invoke('account_create', { username });
    }

    static async load(username: string): Promise<Account | null> {
        return await invoke('account_load', { username });
    }

    static async get_active(): Promise<Account | null> {
        return await invoke('account_get_active');
    }

    static async all(): Promise<Account[]> {
        return await invoke('account_all');
    }
}
