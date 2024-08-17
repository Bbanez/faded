use rand::Rng;
use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::{character::models::stats::CharacterStats, util};

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export)]
pub struct Spell {
    pub id: String,
    pub name: String,
    pub desc: String,
    pub icon: String,
    /**
    Is spell magical
    */
    pub magic: bool,
    pub passive: bool,
    pub mana_cost: f32,
    /**
    Spell demage (min, max)
    */
    pub base_sdmg: (f32, f32),
    /**
    Calc min: `base_sdmg.min + int * int_to_sdmg + <itame_sdmg_effect>`

    Calc min: `base_sdmg.max + int * int_to_sdmg + <itame_sdmg_effect>`
    */
    pub sdmg: (f32, f32),
    /**
    Physical demage (min, max)
    */
    pub base_pdmg: (f32, f32),
    /**
    Calc min: `base_pdmg.min + str * str_to_pdmg + <itame_dmg_effect>`

    Calc min: `base_pdmg.max + str * str_to_pdmg + <itame_dmg_effect>`
    */
    pub pdmg: (f32, f32),
    /**
    From how far can the spell be cast
    */
    pub range: f32,
    /**
    Cooldown in milliseconds
    */
    pub cd: u32,
    /**
    Can Be Used After millis (unix timestamp).
    If current time is smaller then cbua, spell is not usable,
    othervise, spell can be cast
    */
    pub cbua: u128,
    pub str: f32,
    pub agi: f32,
    pub int: f32,
    pub dmg: (f32, f32),
    pub hp: f32,
    pub hp_reg: f32,
    pub cc: f32,
    pub mana: f32,
    pub mana_reg: f32,
    pub ms: f32,
    pub att_spd: f32,
}

impl Spell {
    /**
    Returns a dmg of the spell cast
    */
    pub fn cast(&mut self) -> f32 {
        let mut rng = rand::thread_rng();
        let dmg: f32;
        if self.magic {
            dmg = rng.gen_range(self.sdmg.0..self.sdmg.1);
        } else {
            dmg = rng.gen_range(self.sdmg.0..self.sdmg.1);
        }
        self.cbua = util::time::get_current_millis() + self.cd as u128;
        dmg
    }

    pub fn calc_sdmg(&mut self, stats: &CharacterStats) {
        self.sdmg.0 = self.base_sdmg.0 + stats.int * stats.int_to_sdmg;
        self.sdmg.1 = self.base_sdmg.1 + stats.int * stats.int_to_sdmg;
    }

    pub fn calc_pdmg(&mut self, stats: &CharacterStats) {
        self.pdmg.0 = self.base_pdmg.0 + stats.str * stats.str_to_dmg;
        self.pdmg.1 = self.base_pdmg.1 + stats.str * stats.str_to_dmg;
    }
}
