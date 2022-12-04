import type { 
  BCMSMediaParsed,
  BCMSEntryContentParsedItem
} from '@becomes/cms-client/types';
import type { PostTypeEntry} from '../entry/post_type';
import type { AuthorEntry} from '../entry/author';

export interface PostsEntryMeta {
  title: string;
  slug: string;
  description: string;
  cover_image: BCMSMediaParsed;
  type: PostTypeEntry;
  date: number;
  author?: AuthorEntry;
}

export interface PostsEntry {
  _id: string;
  createdAt: number;
  updatedAt: number;
  templateId: string;
  userId: string;
  status?: string;
  meta: {
    en?: PostsEntryMeta;
  }
  content: {
    en?: BCMSEntryContentParsedItem[];
  }
}