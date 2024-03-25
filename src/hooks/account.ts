import { useQuery } from '../query.ts';
import { rust_api_calls } from '../rust/api-call.ts';

export function useActiveAccount() {
    return useQuery('active_account', async () => {
        return await rust_api_calls.account_get_active();
    });
}

export function useAccounts() {
    return useQuery('accounts', async () => {
        return await rust_api_calls.account_all();
    });
}
