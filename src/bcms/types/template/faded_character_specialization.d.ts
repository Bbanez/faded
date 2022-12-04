import type { BCMSMediaParsed} from '@becomes/cms-client/types';
import type { FadedBaseStatsGroup} from '../group/faded_base_stats';
import type { FadedApStatsGroup} from '../group/faded_ap_stats';
import type { FadedCharacterClassEntry} from '../entry/faded_character_class';
import type { FadedCharacterRaceEntry} from '../entry/faded_character_race';

export interface FadedCharacterSpecializationTemplate {
  title: string;
  slug: string;
  description: string;
  icon: BCMSMediaParsed;
  stats: FadedBaseStatsGroup;
  ap_stats: FadedApStatsGroup;
  class: FadedCharacterClassEntry;
  races: Array<FadedCharacterRaceEntry>;
}