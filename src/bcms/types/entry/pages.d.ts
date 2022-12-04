import type { BannerEntry} from '../entry/banner';
import type { BCMSEntryContentParsedItem} from '@becomes/cms-client/types';

export interface PagesEntryMeta {
  title: string;
  slug: string;
  banner?: BannerEntry;
}

export interface PagesEntry {
  _id: string;
  createdAt: number;
  updatedAt: number;
  templateId: string;
  userId: string;
  status?: string;
  meta: {
    en?: PagesEntryMeta;
  }
  content: {
    en?: BCMSEntryContentParsedItem[];
  }
}