import type { 
  BCMSMediaParsed,
  BCMSEntryContentParsedItem
} from '@becomes/cms-client/types';

export interface BannerEntryMeta {
  title: string;
  slug: string;
  description?: string;
  icon?: BCMSMediaParsed;
}

export interface BannerEntry {
  _id: string;
  createdAt: number;
  updatedAt: number;
  templateId: string;
  userId: string;
  status?: string;
  meta: {
    en?: BannerEntryMeta;
  }
  content: {
    en?: BCMSEntryContentParsedItem[];
  }
}