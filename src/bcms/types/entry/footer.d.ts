import type { FooterItemGroup} from '../group/footer_item';
import type { BCMSEntryContentParsedItem} from '@becomes/cms-client/types';

export interface FooterEntryMeta {
  title: string;
  slug: string;
  items: Array<FooterItemGroup>;
}

export interface FooterEntry {
  _id: string;
  createdAt: number;
  updatedAt: number;
  templateId: string;
  userId: string;
  status?: string;
  meta: {
    en?: FooterEntryMeta;
  }
  content: {
    en?: BCMSEntryContentParsedItem[];
  }
}