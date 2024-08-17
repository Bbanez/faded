use serde::{Deserialize, Serialize};
use ts_rs::TS;

use super::point::Point;

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export)]
pub struct MobDamage {
    pub min: f32,
    pub max: f32,
}

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export)]
pub struct MobStats {
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
    pub damage: MobDamage,
}

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export)]
pub struct Mob {
    pub id: String,
    pub created_at: u128,
    pub updated_at: u128,
    pub position: Point,
    pub model_id: u32,
    pub stats: MobStats,
    wanted_positions: Vec<Point>,
    wanted_position: Option<Point>,
}
