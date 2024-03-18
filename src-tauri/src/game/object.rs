use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::bcms::group::fdd_base_stats::FddBaseStatsGroup;

use super::bounding_box::BoundingBox;

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export)]
pub struct GameObject {
    position: (f32, f32),
    size: (f32, f32),
    pub bb: BoundingBox,
}

impl GameObject {
    pub fn new(position: (f32, f32), size: (f32, f32)) -> GameObject {
        GameObject {
            position,
            size,
            bb: BoundingBox::new(size, position),
        }
    }

    pub fn set_position(&mut self, position: (f32, f32)) {
        self.position = position;
        self.bb.set_position(position);
    }

    pub fn get_position(&mut self) -> (f32, f32) {
        self.position
    }

    pub fn set_size(&mut self, size: (f32, f32)) {
        self.size = size;
        self.bb.set_size(self.size.0, self.size.1);
    }

    pub fn get_size(&mut self) -> (f32, f32) {
        self.size
    }
}

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export)]
pub struct BaseStats {
    pub str: f32,
    pub agi: f32,
    pub int: f32,
    pub hp: f32,
    pub mana: f32,
    pub stamina: f32,
    pub move_speed: f32,
    pub armor: f32,
    pub range: f32,
    pub damage: f32,
}

impl BaseStats {
    pub fn new(
        str: f32,
        agi: f32,
        int: f32,
        hp: f32,
        mana: f32,
        stamina: f32,
        move_speed: f32,
        armor: f32,
        range: f32,
        damage: f32,
    ) -> BaseStats {
        BaseStats {
            str,
            agi,
            int,
            hp,
            mana,
            stamina,
            move_speed,
            armor,
            range,
            damage,
        }
    }

    pub fn new_form_bcms(obj: &FddBaseStatsGroup) -> BaseStats {
        BaseStats {
            str: obj.str as f32,
            agi: obj.agi as f32,
            int: obj.int as f32,
            armor: obj.armor as f32,
            damage: obj.damage as f32,
            hp: obj.hp as f32,
            mana: obj.mana as f32,
            move_speed: obj.move_speed as f32,
            range: obj.range as f32,
            stamina: obj.stamina as f32,
        }
    }
}

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export)]
pub struct CharacterStats {
    pub str: f32,
    pub agi: f32,
    pub int: f32,
    pub max_hp: f32,
    pub hp: f32,
    pub max_mana: f32,
    pub mana: f32,
    pub max_stamina: f32,
    pub stamina: f32,
    pub move_speed: f32,
    pub attack_speed: f32,
    pub armor: f32,
    pub range: f32,
    pub damage: (f32, f32),
}

impl CharacterStats {
    pub fn new(
        str: f32,
        agi: f32,
        int: f32,
        max_hp: f32,
        hp: f32,
        max_mana: f32,
        mana: f32,
        max_stamina: f32,
        stamina: f32,
        move_speed: f32,
        attack_speed: f32,
        armor: f32,
        range: f32,
        damage: (f32, f32),
    ) -> CharacterStats {
        CharacterStats {
            str,
            agi,
            int,
            max_hp,
            hp,
            max_mana,
            mana,
            max_stamina,
            stamina,
            move_speed,
            attack_speed,
            armor,
            range,
            damage,
        }
    }

    pub fn new_from_base_stats(base_stats: BaseStats) -> CharacterStats {
        CharacterStats {
            str: base_stats.str,
            agi: base_stats.agi,
            int: base_stats.int,
            max_hp: base_stats.hp,
            hp: base_stats.hp,
            max_mana: base_stats.mana,
            mana: base_stats.mana,
            max_stamina: base_stats.stamina,
            stamina: base_stats.stamina,
            move_speed: base_stats.move_speed,
            attack_speed: base_stats.agi / 2.0,
            armor: base_stats.armor,
            range: base_stats.range,
            damage: (
                base_stats.damage - base_stats.damage / 2.0,
                base_stats.damage,
            ),
        }
    }
}
