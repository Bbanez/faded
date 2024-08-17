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
