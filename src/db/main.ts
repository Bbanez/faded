import { Ref, ref } from 'vue';
import { DB } from './handler';
import { Account, AccountMethods, accountDb } from './models';

export interface DBHandler {
  accounts: DB<Account, AccountMethods>;
}

let db: Ref<DBHandler>;

export function useDb(): DBHandler {
  if (!db) {
    db = ref<DBHandler>({
      accounts: accountDb,
    });
  }
  return db.value;
}
