import { useQuery } from '../query.ts';
import { AccountHandler } from '../rust/account.ts';

export function useActiveAccount() {
  return useQuery('active_account', async () => {
    return await AccountHandler.get_active();
  });
}
