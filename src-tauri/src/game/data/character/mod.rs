use serde::{Deserialize, Serialize};
use ts_rs::TS;

pub mod demo;

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export)]
pub struct CharacterBaseStats {
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
pub struct CharacterBoundingBox {
    pub x: f32,
    pub y: f32,
    pub z: f32,
}

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[allow(non_snake_case)]
#[ts(export)]
pub struct Character {
    pub id: &'static str,
    pub title: &'static str,
    pub base_stats: CharacterBaseStats,
    pub bb: CharacterBoundingBox,
}
