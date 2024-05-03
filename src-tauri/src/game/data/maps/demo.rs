use crate::game::data::maps::Map;
use crate::game::size::USize;

pub const MAP_DEMO: Map = Map {
    id: "demo",
    title: "Demo",
    width: 100.0,
    height: 100.0,
    start_x: 30.0,
    start_z: 85.0,
    max_players: 3,
    nogo: USize {
        width: 150,
        height: 150,
    },
};