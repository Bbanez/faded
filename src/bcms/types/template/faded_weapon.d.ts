import type { BCMSMediaParsed} from '@becomes/cms-client/types';
import type { FadedItemRarityEntry} from '../entry/faded_item_rarity';
import type { FadedBaseStatsGroup} from '../group/faded_base_stats';
import type { FadedCharacterClassEntry} from '../entry/faded_character_class';
import type { FadedCharacterSpecializationEntry} from '../entry/faded_character_specialization';

export interface FadedWeaponTemplate {
  title: string;
  slug: string;
  description: string;
  icon: BCMSMediaParsed;
  level: number;
  rarity: FadedItemRarityEntry;
  demage: number;
  stats: FadedBaseStatsGroup;
  class: Array<FadedCharacterClassEntry | FadedCharacterSpecializationEntry>;
}