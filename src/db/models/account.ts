import { v4 } from 'uuid';
import { Model } from './_model';
import { createDB } from '..';

export interface Account extends Model {
  username: string;
  level: number;
}

export interface AccountMethods {
  latest(): Account | null;
  findByUsername(username: string): Account | null;
}

export class AccountFactory {
  static create(
    data: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>
  ): Account {
    return {
      id: v4(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ...data,
    };
  }
}

export const accountDb = createDB<Account, AccountMethods>(
  'accounts',
  'id',
  (db) => {
    return {
      latest() {
        const items = db.items();
        let latest: Account | null = null;
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (!latest || latest.updatedAt > item.updatedAt) {
            latest = item;
          }
        }
        return latest;
      },

      findByUsername(username) {
        const item = db.items().find((e) => e.username === username);
        return item || null;
      },
    };
  }
);
