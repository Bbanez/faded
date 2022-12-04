import type { 
  BCMSMediaParsed,
  BCMSEntryContentParsedItem
} from '@becomes/cms-client/types';

export interface FadedCharacterSelectionScreenEntryMeta {
  title: string;
  slug: string;
  background: BCMSMediaParsed;
}

export interface FadedCharacterSelectionScreenEntry {
  _id: string;
  createdAt: number;
  updatedAt: number;
  templateId: string;
  userId: string;
  status?: string;
  meta: {
    en?: FadedCharacterSelectionScreenEntryMeta;
  }
  content: {
    en?: BCMSEntryContentParsedItem[];
  }
}