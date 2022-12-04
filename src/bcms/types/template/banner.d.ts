import type { BCMSMediaParsed} from '@becomes/cms-client/types';

export interface BannerTemplate {
  title: string;
  slug: string;
  description?: string;
  icon?: BCMSMediaParsed;
}