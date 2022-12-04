import type { 
  BCMSMediaParsed,
  BCMSEntryContentParsedItem
} from '@becomes/cms-client/types';

export interface FadedCharacterRaceEntryMeta {
  title: string;
  slug: string;
  description: string;
  icon: BCMSMediaParsed;
  models: Array<BCMSMediaParsed>;
}

export interface FadedCharacterRaceEntry {
  _id: string;
  createdAt: number;
  updatedAt: number;
  templateId: string;
  userId: string;
  status?: string;
  meta: {
    en?: FadedCharacterRaceEntryMeta;
  }
  content: {
    en?: BCMSEntryContentParsedItem[];
  }
}