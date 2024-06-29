use serde::{Deserialize, Serialize};
use ts_rs::TS;

pub mod demo;

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export)]
pub struct LandscapeChunkData {
    pub id: usize,
    pub name: &'static str,
    pub rotation: usize,
    pub sock_x: (usize, usize),
    pub sock_y: (usize, usize),
    pub sock_z: (usize, usize),
}

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export)]
pub struct LandscapeSet {
    pub id: usize,
    pub name: &'static str,
    pub chunks: [LandscapeChunkData; 27],
}
