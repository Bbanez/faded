import type { BCMSMediaParsed} from '@becomes/cms-client/types';
import type { PostTypeEntry} from '../entry/post_type';
import type { AuthorEntry} from '../entry/author';

export interface PostsTemplate {
  title: string;
  slug: string;
  description: string;
  cover_image: BCMSMediaParsed;
  type: PostTypeEntry;
  date: number;
  author?: AuthorEntry;
}