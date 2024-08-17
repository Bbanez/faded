pub mod demo;

use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export)]
pub struct EnemyDataBaseStats {
    pub str: f32,
    pub str_to_hp: f32,
    pub str_to_dmg: f32,
    pub agi: f32,
    pub agi_to_move_speed: f32,
    pub agi_to_dmg: f32,
    pub int: f32,
    pub int_to_mana: f32,
    pub int_to_dmg: f32,
    pub hp: f32,
    pub mana: f32,
    pub stamina: f32,
    pub move_speed: f32,
    pub armor: f32,
    pub range: f32,
    pub damage: f32,
}

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export)]
pub struct EnemyDataBoundingBox {
    pub x: f32,
    pub y: f32,
    pub z: f32,
}

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export)]
pub struct EnemyData {
    pub id: &'static str,
    pub title: &'static str,
    pub base_stats: EnemyDataBaseStats,
    pub bb: EnemyDataBoundingBox,
}
