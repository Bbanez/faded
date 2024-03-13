import { useQuery } from '../query';
import { AccountAll, ActiveAccountGet } from '../../wailsjs/go/game/Api';
import { game } from '../../wailsjs/go/models';
import { onMounted, ref } from 'vue';

export function useActiveAccount() {
    return useQuery('active_account', async () => {
        return await ActiveAccountGet();
    });
}

export function useAccounts(): game.Account[] {
    const accounts = ref<game.Account[]>([]);
    onMounted(async () => {
        accounts.value = await AccountAll();
    });
    return accounts.value;
}
