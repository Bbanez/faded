import type { 
  BCMSMediaParsed,
  BCMSEntryContentParsedItem
} from '@becomes/cms-client/types';
import type { FadedBaseStatsGroup} from '../group/faded_base_stats';
import type { FadedApStatsGroup} from '../group/faded_ap_stats';
import type { FadedCharacterRaceEntry} from '../entry/faded_character_race';

export interface FadedCharacterClassEntryMeta {
  title: string;
  slug: string;
  description: string;
  icon: BCMSMediaParsed;
  stats: FadedBaseStatsGroup;
  ap_stats: FadedApStatsGroup;
  races: Array<FadedCharacterRaceEntry>;
  animations: Array<BCMSMediaParsed>;
}

export interface FadedCharacterClassEntry {
  _id: string;
  createdAt: number;
  updatedAt: number;
  templateId: string;
  userId: string;
  status?: string;
  meta: {
    en?: FadedCharacterClassEntryMeta;
  }
  content: {
    en?: BCMSEntryContentParsedItem[];
  }
}