import type { BCMSMediaParsed} from '@becomes/cms-client/types';

export interface AuthorTemplate {
  title: string;
  slug: string;
  avatar?: BCMSMediaParsed;
}