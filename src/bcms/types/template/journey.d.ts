import type { BCMSMediaParsed} from '@becomes/cms-client/types';
import type { PostsEntry} from '../entry/posts';
import type { BannerEntry} from '../entry/banner';

export interface JourneyTemplate {
  title: string;
  slug: string;
  description: string;
  cover_image: BCMSMediaParsed;
  collection: Array<PostsEntry>;
  banner: BannerEntry;
}