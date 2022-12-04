import type { 
  BCMSMediaParsed,
  BCMSEntryContentParsedItem
} from '@becomes/cms-client/types';

export interface AuthorEntryMeta {
  title: string;
  slug: string;
  avatar?: BCMSMediaParsed;
}

export interface AuthorEntry {
  _id: string;
  createdAt: number;
  updatedAt: number;
  templateId: string;
  userId: string;
  status?: string;
  meta: {
    en?: AuthorEntryMeta;
  }
  content: {
    en?: BCMSEntryContentParsedItem[];
  }
}