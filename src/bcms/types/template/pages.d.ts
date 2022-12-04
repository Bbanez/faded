import type { BannerEntry} from '../entry/banner';

export interface PagesTemplate {
  title: string;
  slug: string;
  banner?: BannerEntry;
}