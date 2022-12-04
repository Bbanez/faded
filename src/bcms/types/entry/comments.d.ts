import type { BCMSEntryContentParsedItem} from '@becomes/cms-client/types';

export interface CommentsEntryMeta {
  title: string;
  slug: string;
  account_id?: string;
  comment: string;
  replied_to_id?: string;
  post_id: string;
  is_thread?: boolean;
}

export interface CommentsEntry {
  _id: string;
  createdAt: number;
  updatedAt: number;
  templateId: string;
  userId: string;
  status?: string;
  meta: {
    en?: CommentsEntryMeta;
  }
  content: {
    en?: BCMSEntryContentParsedItem[];
  }
}