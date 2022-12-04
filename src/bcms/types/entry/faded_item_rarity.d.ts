import type { BCMSEntryContentParsedItem} from '@becomes/cms-client/types';

export interface FadedItemRarityEntryMeta {
  title: string;
  slug: string;
  color: string;
}

export interface FadedItemRarityEntry {
  _id: string;
  createdAt: number;
  updatedAt: number;
  templateId: string;
  userId: string;
  status?: string;
  meta: {
    en?: FadedItemRarityEntryMeta;
  }
  content: {
    en?: BCMSEntryContentParsedItem[];
  }
}