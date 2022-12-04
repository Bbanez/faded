import type { 
  BCMSMediaParsed,
  BCMSEntryContentParsedItem
} from '@becomes/cms-client/types';
import type { FadedItemRarityEntry} from '../entry/faded_item_rarity';
import type { FadedBaseStatsGroup} from '../group/faded_base_stats';
import type { FadedApStatsGroup} from '../group/faded_ap_stats';
import type { FadedCharacterClassEntry} from '../entry/faded_character_class';
import type { FadedCharacterSpecializationEntry} from '../entry/faded_character_specialization';

export interface FadedArmorGlovesEntryMeta {
  title: string;
  slug: string;
  description: string;
  icon: BCMSMediaParsed;
  level: number;
  rarity: FadedItemRarityEntry;
  def: number;
  stats: FadedBaseStatsGroup;
  ap_stats: FadedApStatsGroup;
  class: Array<FadedCharacterClassEntry | FadedCharacterSpecializationEntry>;
}

export interface FadedArmorGlovesEntry {
  _id: string;
  createdAt: number;
  updatedAt: number;
  templateId: string;
  userId: string;
  status?: string;
  meta: {
    en?: FadedArmorGlovesEntryMeta;
  }
  content: {
    en?: BCMSEntryContentParsedItem[];
  }
}