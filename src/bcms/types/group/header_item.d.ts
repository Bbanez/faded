import type { BCMSMediaParsed} from '@becomes/cms-client/types';
import type { PagesEntry} from '../entry/pages';

export interface HeaderItemGroup {
  name: string;
  icon?: BCMSMediaParsed;
  ref?: PagesEntry;
  left?: boolean;
}