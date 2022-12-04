import type { BCMSEntryContentParsedItem} from '@becomes/cms-client/types';

export interface VideoTranscriptsEntryMeta {
  title: string;
  slug: string;
}

export interface VideoTranscriptsEntry {
  _id: string;
  createdAt: number;
  updatedAt: number;
  templateId: string;
  userId: string;
  status?: string;
  meta: {
    en?: VideoTranscriptsEntryMeta;
  }
  content: {
    en?: BCMSEntryContentParsedItem[];
  }
}