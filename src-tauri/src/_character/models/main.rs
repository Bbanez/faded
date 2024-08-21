use std::sync::MutexGuard;

use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::{
    db::storage::DB_STOREAGE_SPLIT_CHAR,
    util::{
        self, b64,
        math::{remap, Point3, PI, PI12},
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
    /**
    Time of the last update call in milliseconds
    */
    pub last_update: u128,
    pub dead: bool,
    pub rev: bool,
    pub rev_at: u128,
    pub base_rev_t: u128,
    pub rev_inc_per_lvl: u128,
    pub bb: Point3,
}

const CHARACTER_MAX_EXP: f32 = 1300.0;
const CHARACTER_MAX_LVL: f32 = 30.0;

impl Character {
    pub fn exp_to_lvl(exp: f32) -> f32 {
        let f_in = remap(exp, 0.0, CHARACTER_MAX_EXP, 0.0, PI12);
        remap(-1.0 * (f_in - PI).sin(), 0.0, 1.0, 1.0, CHARACTER_MAX_LVL)
    }

    pub fn update(&mut self, state: &MutexGuard<State>) {
        let mut items: Vec<Item> = vec![];
        for i in 0..state.game_map_repo.items.len() {}
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

    pub fn serialize(char: &Character) -> String {
        let mut spell_ids: String;
        if char.spell_ids.len() > 0 {
            spell_ids = char.spell_ids[0].clone();
            for i in 1..char.spell_ids.len() {
                spell_ids = format!("{},{}", spell_ids, char.spell_ids[i]);
            }
        } else {
            spell_ids = "".to_string()
        }
        let mut item_ids: String;
        if char.item_ids.len() > 0 {
            item_ids = char.item_ids[0].clone();
            for i in 1..char.spell_ids.len() {
                item_ids = format!("{},{}", item_ids, char.item_ids[i]);
            }
        } else {
            item_ids = "".to_string()
        }
        format!(
            "{}{}\
            {}{}\
            {}{}\
            {}{}\
            {}{}\
            {}{}\
            {}{}\
            {}{}\
            {}{}\
            {}{}\
            {}{}\
            {}{}\
            {},{},{}",
            /*[0]*/ char.id,
            DB_STOREAGE_SPLIT_CHAR,
            /*[1]*/ b64::encode(&char.name),
            DB_STOREAGE_SPLIT_CHAR,
            /*[2]*/ b64::encode(&char.desc),
            DB_STOREAGE_SPLIT_CHAR,
            /*[3]*/ CharacterStats::serialize(&char.stats),
            DB_STOREAGE_SPLIT_CHAR,
            /*[4]*/ spell_ids,
            DB_STOREAGE_SPLIT_CHAR,
            /*[5]*/ item_ids,
            DB_STOREAGE_SPLIT_CHAR,
            /*[6]*/ char.last_update,
            DB_STOREAGE_SPLIT_CHAR,
            /*[7]*/ char.dead,
            DB_STOREAGE_SPLIT_CHAR,
            /*[8]*/ char.rev,
            DB_STOREAGE_SPLIT_CHAR,
            /*[9]*/ char.rev_at,
            DB_STOREAGE_SPLIT_CHAR,
            /*[10]*/ char.base_rev_t,
            DB_STOREAGE_SPLIT_CHAR,
            /*[11]*/ char.rev_inc_per_lvl,
            DB_STOREAGE_SPLIT_CHAR,
            /*[12]*/ char.bb.x,
            /*[12]*/ char.bb.y,
            /*[12]*/ char.bb.z,
        )
    }

    pub fn deserialize(serialized: &str) -> Character {
        let parts: Vec<&str> = serialized.split(DB_STOREAGE_SPLIT_CHAR).collect();
        let spell_ids: Vec<&str> = parts[4].split(",").collect();
        let item_ids: Vec<&str> = parts[5].split(",").collect();
        let bb_parts: Vec<&str> = parts[12].split(",").collect();
        Character {
            id: parts[0].to_string(),
            name: b64::decode(parts[1]),
            desc: b64::decode(parts[2]),
            stats: CharacterStats::deserialize(parts[3]),
            spell_ids: spell_ids.iter().map(|e| e.to_string()).collect(),
            item_ids: item_ids.iter().map(|e| e.to_string()).collect(),
            last_update: parts[6].parse().unwrap(),
            dead: parts[7].parse().unwrap(),
            rev: parts[8].parse().unwrap(),
            rev_at: parts[9].parse().unwrap(),
            base_rev_t: parts[10].parse().unwrap(),
            rev_inc_per_lvl: parts[11].parse().unwrap(),
            bb: Point3::new(
                bb_parts[0].parse().unwrap(),
                bb_parts[1].parse().unwrap(),
                bb_parts[2].parse().unwrap(),
            ),
        }
    }
}
