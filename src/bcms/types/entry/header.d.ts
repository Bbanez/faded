import type { HeaderItemGroup} from '../group/header_item';
import type { BCMSEntryContentParsedItem} from '@becomes/cms-client/types';

export interface HeaderEntryMeta {
  title: string;
  slug: string;
  items: Array<HeaderItemGroup>;
}

export interface HeaderEntry {
  _id: string;
  createdAt: number;
  updatedAt: number;
  templateId: string;
  userId: string;
  status?: string;
  meta: {
    en?: HeaderEntryMeta;
  }
  content: {
    en?: BCMSEntryContentParsedItem[];
  }
}