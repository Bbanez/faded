use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::{
    objects::{item::Item, spell::Spell},
    util::{
        self,
        math::{remap, PI, PI12},
    },
};

use super::stats::CharacterStats;

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export)]
pub struct Character {
    pub id: String,
    pub name: String,
    pub desc: String,
    pub stats: CharacterStats,
    pub spells: Vec<Spell>,
    pub items: Vec<Item>,
    /**
    Time of the last update call in milliseconds
    */
    pub last_update: u128,
    pub dead: bool,
    pub rev: bool,
    pub rev_at: u128,
    pub base_rev_t: u128,
    pub rev_inc_per_lvl: u128,
}

const CHARACTER_MAX_EXP: f32 = 1300.0;
const CHARACTER_MAX_LVL: f32 = 30.0;

impl Character {
    pub fn exp_to_lvl(exp: f32) -> f32 {
        let f_in = remap(exp, 0.0, CHARACTER_MAX_EXP, 0.0, PI12);
        remap(-1.0 * (f_in - PI).sin(), 0.0, 1.0, 1.0, CHARACTER_MAX_LVL)
    }

    pub fn update(&mut self) {
        let c_time = util::time::get_current_millis();
        let td = (c_time - self.last_update) as f32;
        self.last_update = c_time;
        self.stats.lvl = Character::exp_to_lvl(self.stats.exp);
        self.stats.str = self.stats.base_str
            + self.stats.str_per_lvl * (self.stats.lvl - 1.0)
            + self.items.iter().fold(0.0, |acc, i| acc + i.str)
            + self.spells.iter().fold(0.0, |acc, s| acc + s.str);
        self.stats.agi = self.stats.base_agi
            + self.stats.agi_per_lvl * (self.stats.lvl - 1.0)
            + self.items.iter().fold(0.0, |acc, i| acc + i.agi)
            + self.spells.iter().fold(0.0, |acc, s| acc + s.agi);
        self.stats.int = self.stats.base_int
            + self.stats.int_per_lvl * (self.stats.lvl - 1.0)
            + self.items.iter().fold(0.0, |acc, i| acc + i.int)
            + self.spells.iter().fold(0.0, |acc, s| acc + s.int);
        self.stats.cc = self.stats.base_cc
            + self.stats.agi * self.stats.agi_to_cc
            + self.items.iter().fold(0.0, |acc, i| acc + i.cc)
            + self.spells.iter().fold(0.0, |acc, s| acc + s.cc);
        self.stats.hp_reg = self.stats.base_hp_reg
            + self.stats.hp_reg_per_lvl * (self.stats.lvl - 1.0)
            + self.items.iter().fold(0.0, |acc, i| acc + i.hp_reg)
            + self.spells.iter().fold(0.0, |acc, s| acc + s.hp_reg);
        self.stats.max_hp = self.stats.base_hp
            + self.stats.str * self.stats.str_to_hp
            + self.items.iter().fold(0.0, |acc, i| acc + i.hp)
            + self.spells.iter().fold(0.0, |acc, s| acc + s.hp);
        self.stats.max_mana = self.stats.base_mana
            + self.stats.int * self.stats.int_to_mana
            + self.items.iter().fold(0.0, |acc, i| acc + i.mana)
            + self.spells.iter().fold(0.0, |acc, s| acc + s.mana);
        self.stats.mana_reg = self.stats.mana_reg
            + self.stats.int * self.stats.int_to_mana_reg
            + self.items.iter().fold(0.0, |acc, i| acc + i.mana_reg)
            + self.spells.iter().fold(0.0, |acc, s| acc + s.mana_reg);
        self.stats.ms = self.stats.base_ms
            + self.stats.agi * self.stats.agi_to_ms
            + self.items.iter().fold(0.0, |acc, i| acc + i.ms)
            + self.spells.iter().fold(0.0, |acc, s| acc + s.ms);
        self.stats.atts_spd = self.stats.base_att_spd
            + self.stats.agi * self.stats.agi_to_att_spd
            + self.items.iter().fold(0.0, |acc, i| acc + i.att_spd)
            + self.spells.iter().fold(0.0, |acc, s| acc + s.att_spd);
        self.stats.armor = self.stats.base_armor
            + self.stats.armor_per_lvl * (self.stats.lvl - 1.0)
            + self.items.iter().fold(0.0, |acc, i| acc + i.att_spd)
            + self.spells.iter().fold(0.0, |acc, s| acc + s.att_spd);
        self.stats.hp = self.stats.hp + self.stats.hp_reg * td / 1000.0;
        self.stats.mana = self.stats.hp + self.stats.mana_reg * td / 1000.0;
        if self.stats.hp > self.stats.max_hp {
            self.stats.hp = self.stats.max_hp;
        }
        if self.stats.mana > self.stats.max_mana {
            self.stats.mana = self.stats.max_mana;
        }
        if self.dead {
            if self.rev_at < c_time {
                self.stats.hp = self.stats.max_hp;
                self.stats.mana = self.stats.max_mana;
                self.rev = true;
            }
        }
    }

    pub fn take_dmg(&mut self, dmg: f32) {
        let reduced_dmg = dmg - self.stats.armor;
        if reduced_dmg < 0.0 {
            return;
        }
        self.stats.hp = self.stats.hp - reduced_dmg;
        if self.stats.hp <= 0.0 {
            self.dead = true;
            self.rev_at =
                util::time::get_current_millis() + self.base_rev_t * self.stats.lvl as u128;
        }
    }
}
