import type { BCMSEntryContentParsedItem} from '@becomes/cms-client/types';

export interface AccountsEntryMeta {
  title: string;
  slug: string;
  email_hash: string;
  password_hash: string;
  verified?: boolean;
  otp?: string;
}

export interface AccountsEntry {
  _id: string;
  createdAt: number;
  updatedAt: number;
  templateId: string;
  userId: string;
  status?: string;
  meta: {
    en?: AccountsEntryMeta;
  }
  content: {
    en?: BCMSEntryContentParsedItem[];
  }
}