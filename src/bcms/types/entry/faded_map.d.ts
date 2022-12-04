import type { 
  BCMSMediaParsed,
  BCMSEntryContentParsedItem
} from '@becomes/cms-client/types';

export interface FadedMapEntryMeta {
  title: string;
  slug: string;
  description: string;
  icon: BCMSMediaParsed;
  model: BCMSMediaParsed;
  props: Array<BCMSMediaParsed>;
}

export interface FadedMapEntry {
  _id: string;
  createdAt: number;
  updatedAt: number;
  templateId: string;
  userId: string;
  status?: string;
  meta: {
    en?: FadedMapEntryMeta;
  }
  content: {
    en?: BCMSEntryContentParsedItem[];
  }
}