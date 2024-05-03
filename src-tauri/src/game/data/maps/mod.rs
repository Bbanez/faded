pub mod demo;

use serde::{Deserialize, Serialize};
use ts_rs::TS;
use crate::game::size::USize;

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export)]
pub struct Map {
    pub id: &'static str,
    pub title: &'static str,
    pub width: f32,
    pub height: f32,
    pub max_players: usize,
    pub start_x: f32,
    pub start_z: f32,
    pub nogo: USize,
}
