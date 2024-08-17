import { api_call } from '@fdd/rust/api-call';
import type { Account } from '@fdd/types/rs';
import { createArrayStore } from '@fdd/util/array-store';
import { QueueError, createQueue } from '@fdd/util/queue';

export interface AccountStoreMethods {
    findActive(): Account | null;
}

export class AccountHandler {
    rust = {
        create: api_call<{ username: string }, Account>('account_create'),
        load: api_call<{ id: string }, Account>('account_load'),
        getActive: api_call<void, Account | null>('account_get_active'),
        getByUsername: api_call<{ username: string }, Account | null>(
            'account_get_by_username',
        ),
        all: api_call<void, Account[]>('account_all'),
    };

    private getAllQueue = createQueue<Account[]>();
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
        const result = await this.getAllQueue({
            name: 'get_all',
            handler: async () => {
                if (!skip_cache && this.latch.all) {
                    return this.store.items();
                }
                const accounts = await this.rust.all();
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
        const account = await this.rust.getByUsername({ username });
        if (account) {
            this.store.set(account);
            return account;
        } else {
            throw new Error(`Account "${username}" not found`);
        }
    }

    async load(id: string) {
        const account = await this.rust.load({ id });
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
        const account = await this.rust.getActive();
        if (account) {
            this.store.set(account);
        }
        return account;
    }

    async create(username: string) {
        const account = await this.rust.create({ username });
        this.store.set(account);
        return account;
    }
}
