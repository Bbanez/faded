import type { BCMSMediaParsed} from '@becomes/cms-client/types';

export interface FadedMapTemplate {
  title: string;
  slug: string;
  description: string;
  icon: BCMSMediaParsed;
  model: BCMSMediaParsed;
  props: Array<BCMSMediaParsed>;
}