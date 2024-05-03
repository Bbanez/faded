import { createQueue } from '@banez/queue';
import { Account } from '../../types/rs';
import { QueueError } from '@banez/queue/types';
import { api_call } from '../../rust/api-call.ts';
import { createArrayStore } from '@banez/vue-array-store';

export interface AccountStoreMethods {
    findActive(): Account | null;
}

export class AccountHandler {
    private rust_create = api_call<{ username: string }, Account>(
        'account_create',
    );
    private rust_load = api_call<{ username: string }, Account>('account_load');
    private rust_get_active = api_call<void, Account | null>(
        'account_get_active',
    );
    private rust_get_by_username = api_call<
        { username: string },
        Account | null
    >('account_get_by_username');
    private rust_account_all = api_call<void, Account[]>('account_all');

    private get_all_queue = createQueue<Account[]>();
    private latch: {
        [name: string]: boolean;
    } = {};

    store = createArrayStore<Account, AccountStoreMethods>(
        'username',
        [],
        (store) => {
            return {
                findActive() {
                    return store.find((e) => e.active);
                },
            };
        },
    );

    constructor() {}

    async get_all(skip_cache?: boolean) {
        const result = await this.get_all_queue({
            name: 'get_all',
            handler: async () => {
                if (!skip_cache && this.latch.all) {
                    return this.store.items();
                }
                const accounts = await this.rust_account_all();
                this.store.set(accounts);
                return accounts;
            },
        }).wait;
        if (result instanceof QueueError) {
            throw result.error;
        }
        return result.data;
    }

    async get(username: string, skip_cache?: boolean) {
        if (!skip_cache) {
            const cache_hit = this.store.findById(username);
            if (cache_hit) {
                return cache_hit;
            }
        }
        const account = await this.rust_get_by_username({ username });
        if (account) {
            this.store.set(account);
            return account;
        } else {
            throw new Error(`Account "${username}" not found`);
        }
    }

    async load(username: string) {
        const account = await this.rust_load({ username });
        this.store.items().forEach((e) => (e.active = false));
        this.store.set(account);
        return account;
    }

    async get_active(skip_cache?: boolean) {
        if (!skip_cache) {
            const cache_hit = this.store.find((e) => e.active);
            if (cache_hit) {
                return cache_hit;
            }
        }
        const account = await this.rust_get_active();
        if (account) {
            this.store.set(account);
        }
        return account;
    }

    async create(username: string) {
        const account = await this.rust_create({ username });
        this.store.set(account);
        return account;
    }
}
