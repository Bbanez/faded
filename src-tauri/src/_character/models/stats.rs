use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export)]
pub struct CharacterStats {
    pub base_str: f32,
    pub str_per_lvl: f32,
    /**
    Calc change: `base_str + str_per_lvl * (lvl - 1) + <items_effect>`
    */
    pub str: f32,
    /**
    How str influence the HP
    */
    pub str_to_hp: f32,
    /**
    How str influence the damage
    */
    pub str_to_dmg: f32,
    pub base_agi: f32,
    pub agi_per_lvl: f32,
    /**
    Calc per changek: `base_agi + agi_per_lvl * (lvl - 1) + <items_effect>`
    */
    pub agi: f32,
    /**
    How agi influence movement speed
    */
    pub agi_to_ms: f32,
    /**
    How agi influence attack speed
    */
    pub agi_to_att_spd: f32,
    /**
    How agi influence critical chance
    */
    pub agi_to_cc: f32,
    pub base_cc: f32,
    /**
    Critical chance

    Calc per change: `base_cc + agi * agi_to_cc + <items_effect>`
    */
    pub cc: f32,
    pub base_int: f32,
    pub int_per_lvl: f32,
    /**
    Calc per change: `base_int + int_per_lvl * (lvl - 1) + <items_effect>`
    */
    pub int: f32,
    /**
    How int influence mana
    */
    pub int_to_mana: f32,
    /**
    How int influence mana_reg
    */
    pub int_to_mana_reg: f32,
    /**
    How int influence spell demage
    */
    pub int_to_sdmg: f32,
    pub base_hp_reg: f32,
    pub hp_reg_per_lvl: f32,
    /**
    Calc per change: `base_hp_reg + hp_reg_per_lvl * (lvl - 1) + <items_effect>`
    */
    pub hp_reg: f32,
    pub base_hp: f32,
    /**
    Calc per game tick: `base_hp + <items_effect>`
    */
    pub max_hp: f32,
    /**
    Current HP of the character. If HP == 0, character is dead.

    Calc per game tick: `hp >= max_hp ? max_hp : hp + hp_reg`
    */
    pub hp: f32,
    pub base_mana_reg: f32,
    pub mana_reg_per_lvl: f32,
    /**
    Calc per change: `base_mana_reg + mana_reg_per_lvl * (lvl - 1) + <items_effect>`
    */
    pub mana_reg: f32,
    /**
    Calc per change: `base_mana + int * int_to_mana +  <items_effect>`
    */
    pub max_mana: f32,
    pub base_mana: f32,
    /**
    Current HP of the character. If HP == 0, character is dead.

    Calc per game tick: `mana >= max_mana ? max_mana : mana + mana_reg`
    */
    pub mana: f32,
    /**
    Base movement speed
    */
    pub base_ms: f32,
    /**
    Current character movement speed.

    Calc per change: `base_mv + agi * agi_to_ms + <items_effect>`
    */
    pub ms: f32,
    /**
    Base attack speed
    */
    pub base_att_spd: f32,
    /**
    Current character attack speed in milliseconds.

    Calc per change: `base_att_spd + agi * agi_to_att_spd + <items_effect>`
    */
    pub atts_spd: f32,
    pub base_armor: f32,
    pub armor_per_lvl: f32,
    /**
    Current armot value.

    Calc: base_arrmot + <items_effect>

    Dmg reduction: taken_dmg - armor
    */
    pub armor: f32,
    pub exp: f32,
    /**
    Calc based on exp and exp_fn
    */
    pub lvl: f32,
}

impl CharacterStats {
    pub fn serialize(stats: &CharacterStats) -> String {
        format!(
            "{},\
            {},\
            {},\
            {},\
            {},\
            {},\
            {},\
            {},\
            {},\
            {},\
            {},\
            {},\
            {},\
            {},\
            {},\
            {},\
            {},\
            {},\
            {},\
            {},\
            {},\
            {},\
            {},\
            {},\
            {},\
            {},\
            {},\
            {},\
            {},\
            {},\
            {},\
            {},\
            {},\
            {},\
            {},\
            {},\
            {},\
            {},\
            {},\
            {}
            ",
            stats.base_str,
            stats.str_per_lvl,
            stats.str,
            stats.str_to_hp,
            stats.str_to_dmg,
            stats.base_agi,
            stats.agi_per_lvl,
            stats.agi,
            stats.agi_to_ms,
            stats.agi_to_att_spd,
            stats.agi_to_cc,
            stats.base_cc,
            stats.cc,
            stats.base_int,
            stats.int_per_lvl,
            stats.int,
            stats.int_to_mana,
            stats.int_to_mana_reg,
            stats.int_to_sdmg,
            stats.base_hp_reg,
            stats.hp_reg_per_lvl,
            stats.hp_reg,
            stats.base_hp,
            stats.max_hp,
            stats.hp,
            stats.base_mana_reg,
            stats.mana_reg_per_lvl,
            stats.mana_reg,
            stats.max_mana,
            stats.base_mana,
            stats.mana,
            stats.base_ms,
            stats.ms,
            stats.base_att_spd,
            stats.atts_spd,
            stats.base_armor,
            stats.armor_per_lvl,
            stats.armor,
            stats.exp,
            stats.lvl,
        )
    }

    pub fn deserialize(s: &str) -> CharacterStats {
        let parts: Vec<&str> = s.split(",").collect();
        CharacterStats {
            base_str: parts[0].parse().unwrap(),
            str_per_lvl: parts[1].parse().unwrap(),
            str: parts[2].parse().unwrap(),
            str_to_hp: parts[3].parse().unwrap(),
            str_to_dmg: parts[4].parse().unwrap(),
            base_agi: parts[5].parse().unwrap(),
            agi_per_lvl: parts[6].parse().unwrap(),
            agi: parts[7].parse().unwrap(),
            agi_to_ms: parts[8].parse().unwrap(),
            agi_to_att_spd: parts[9].parse().unwrap(),
            agi_to_cc: parts[10].parse().unwrap(),
            base_cc: parts[11].parse().unwrap(),
            cc: parts[12].parse().unwrap(),
            base_int: parts[13].parse().unwrap(),
            int_per_lvl: parts[14].parse().unwrap(),
            int: parts[15].parse().unwrap(),
            int_to_mana: parts[16].parse().unwrap(),
            int_to_mana_reg: parts[17].parse().unwrap(),
            int_to_sdmg: parts[18].parse().unwrap(),
            base_hp_reg: parts[19].parse().unwrap(),
            hp_reg_per_lvl: parts[20].parse().unwrap(),
            hp_reg: parts[21].parse().unwrap(),
            base_hp: parts[22].parse().unwrap(),
            max_hp: parts[23].parse().unwrap(),
            hp: parts[24].parse().unwrap(),
            base_mana_reg: parts[25].parse().unwrap(),
            mana_reg_per_lvl: parts[26].parse().unwrap(),
            mana_reg: parts[27].parse().unwrap(),
            max_mana: parts[28].parse().unwrap(),
            base_mana: parts[29].parse().unwrap(),
            mana: parts[30].parse().unwrap(),
            base_ms: parts[31].parse().unwrap(),
            ms: parts[32].parse().unwrap(),
            base_att_spd: parts[33].parse().unwrap(),
            atts_spd: parts[34].parse().unwrap(),
            base_armor: parts[35].parse().unwrap(),
            armor_per_lvl: parts[36].parse().unwrap(),
            armor: parts[37].parse().unwrap(),
            exp: parts[38].parse().unwrap(),
            lvl: parts[39].parse().unwrap(),
        }
    }
}
