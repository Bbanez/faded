import type { 
  BCMSMediaParsed,
  BCMSEntryContentParsedItem
} from '@becomes/cms-client/types';
import type { PostsEntry} from '../entry/posts';
import type { BannerEntry} from '../entry/banner';

export interface JourneyEntryMeta {
  title: string;
  slug: string;
  description: string;
  cover_image: BCMSMediaParsed;
  collection: Array<PostsEntry>;
  banner: BannerEntry;
}

export interface JourneyEntry {
  _id: string;
  createdAt: number;
  updatedAt: number;
  templateId: string;
  userId: string;
  status?: string;
  meta: {
    en?: JourneyEntryMeta;
  }
  content: {
    en?: BCMSEntryContentParsedItem[];
  }
}