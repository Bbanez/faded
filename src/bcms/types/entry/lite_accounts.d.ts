import type { BCMSEntryContentParsedItem} from '@becomes/cms-client/types';

export interface LiteAccountsEntryMeta {
  title: string;
  slug: string;
  account_id: string;
}

export interface LiteAccountsEntry {
  _id: string;
  createdAt: number;
  updatedAt: number;
  templateId: string;
  userId: string;
  status?: string;
  meta: {
    en?: LiteAccountsEntryMeta;
  }
  content: {
    en?: BCMSEntryContentParsedItem[];
  }
}