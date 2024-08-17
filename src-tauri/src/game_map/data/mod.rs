use serde::{Deserialize, Serialize};
use ts_rs::TS;

pub mod landscape_set_demo;

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export)]
pub struct GameMapLandscapeChunkInfo {
    pub id: u32,
    pub name: String,
    pub walkable: bool,
}

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export)]
pub struct GameMapLandscapeSet {
    pub id: u32,
    pub name: String,
    pub chunks: Vec<GameMapLandscapeChunkInfo>,
}
