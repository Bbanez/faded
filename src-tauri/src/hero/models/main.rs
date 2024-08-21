use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::{
    db::storage::DB_STOREAGE_SPLIT_CHAR,
    util::{game_entiry::GameEntity, math::Point3},
};

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export)]
pub struct Hero {
    pub id: String,
    pub name: String,
    pub desc: String,
    pub str: f32,
    pub agi: f32,
    pub int: f32,
    pub dmg: (f32, f32),
    pub max_hp: f32,
    pub hp: f32,
    pub bb: Point3,
}

impl GameEntity for Hero {
    fn update() {
        println!("Update hero");
    }
}

impl Hero {
    pub fn new_empty() -> Hero {
        Hero {
            id: "".to_string(),
            name: "".to_string(),
            desc: "".to_string(),
            agi: 0.0,
            bb: Point3::new(0.0, 0.0, 0.0),
            dmg: (0.0, 0.0),
            hp: 0.0,
            int: 0.0,
            max_hp: 0.0,
            str: 0.0,
        }
    }

    pub fn serialize(hero: &Hero) -> String {
        format!(
            "{}{}\
            {}{}\
            {}{}\
            {}{}\
            {},{}{}\
            {}{}\
            {}{}\
            {},{},{}{}\
            {}{}\
            {}",
            /*[0]*/ hero.id,
            DB_STOREAGE_SPLIT_CHAR,
            /*[1]*/ hero.str,
            DB_STOREAGE_SPLIT_CHAR,
            /*[2]*/ hero.agi,
            DB_STOREAGE_SPLIT_CHAR,
            /*[3]*/ hero.int,
            DB_STOREAGE_SPLIT_CHAR,
            /*[4]*/ hero.dmg.0,
            /*[4]*/ hero.dmg.1,
            DB_STOREAGE_SPLIT_CHAR,
            /*[5]*/ hero.max_hp,
            DB_STOREAGE_SPLIT_CHAR,
            /*[6]*/ hero.hp,
            DB_STOREAGE_SPLIT_CHAR,
            /*[7]*/ hero.bb.x,
            /*[7]*/ hero.bb.y,
            /*[7]*/ hero.bb.z,
            DB_STOREAGE_SPLIT_CHAR,
            /*[8]*/ hero.name,
            DB_STOREAGE_SPLIT_CHAR,
            /*[9]*/ hero.desc,
        )
    }

    pub fn deserialize(parts: &[&str]) -> Hero {
        let dmg_parts: Vec<&str> = parts[4].split(",").collect();
        let bb_parts: Vec<&str> = parts[7].split(",").collect();
        Hero {
            id: parts[0].to_string(),
            name: parts[8].to_string(),
            desc: parts[9].to_string(),
            str: parts[1].parse().unwrap(),
            agi: parts[2].parse().unwrap(),
            int: parts[3].parse().unwrap(),
            dmg: (dmg_parts[0].parse().unwrap(), dmg_parts[1].parse().unwrap()),
            max_hp: parts[5].parse().unwrap(),
            hp: parts[6].parse().unwrap(),
            bb: Point3::new(
                bb_parts[0].parse().unwrap(),
                bb_parts[1].parse().unwrap(),
                bb_parts[2].parse().unwrap(),
            ),
        }
    }
}
