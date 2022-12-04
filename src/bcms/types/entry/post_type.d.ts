import type { BCMSEntryContentParsedItem} from '@becomes/cms-client/types';

export interface PostTypeEntryMeta {
  title: string;
  slug: string;
}

export interface PostTypeEntry {
  _id: string;
  createdAt: number;
  updatedAt: number;
  templateId: string;
  userId: string;
  status?: string;
  meta: {
    en?: PostTypeEntryMeta;
  }
  content: {
    en?: BCMSEntryContentParsedItem[];
  }
}