import type { BCMSMediaParsed} from '@becomes/cms-client/types';

export interface FadedCharacterRaceTemplate {
  title: string;
  slug: string;
  description: string;
  icon: BCMSMediaParsed;
  models: Array<BCMSMediaParsed>;
}