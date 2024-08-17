use super::{GameMapLandscapeChunkInfo, GameMapLandscapeSet};

pub fn get_game_map_landscape_sets() -> Vec<GameMapLandscapeSet> {
    vec![demo()]
}

fn demo() -> GameMapLandscapeSet {
    return GameMapLandscapeSet {
        id: 0,
        name: "demo".to_string(),
        chunks: vec![
            GameMapLandscapeChunkInfo {
                id: 0,
                name: "air".to_string(),
                walkable: false,
            },
            GameMapLandscapeChunkInfo {
                id: 1,
                name: "plane".to_string(),
                walkable: true,
            },
            GameMapLandscapeChunkInfo {
                id: 2,
                name: "edge".to_string(),
                walkable: false,
            },
            GameMapLandscapeChunkInfo {
                id: 3,
                name: "edge-in".to_string(),
                walkable: false,
            },
            GameMapLandscapeChunkInfo {
                id: 4,
                name: "edge-out".to_string(),
                walkable: false,
            },
            GameMapLandscapeChunkInfo {
                id: 5,
                name: "ramp-s1".to_string(),
                walkable: true,
            },
            GameMapLandscapeChunkInfo {
                id: 6,
                name: "ramp-s1-c1".to_string(),
                walkable: false,
            },
            GameMapLandscapeChunkInfo {
                id: 7,
                name: "ramp-s1-c2".to_string(),
                walkable: false,
            },
            GameMapLandscapeChunkInfo {
                id: 8,
                name: "ramp-s1-ed".to_string(),
                walkable: false,
            },
            GameMapLandscapeChunkInfo {
                id: 9,
                name: "ramp-s1-eu".to_string(),
                walkable: false,
            },
            GameMapLandscapeChunkInfo {
                id: 10,
                name: "ramp-s2".to_string(),
                walkable: true,
            },
            GameMapLandscapeChunkInfo {
                id: 11,
                name: "ramp-s2-c1".to_string(),
                walkable: false,
            },
            GameMapLandscapeChunkInfo {
                id: 12,
                name: "ramp-s2-c2".to_string(),
                walkable: false,
            },
            GameMapLandscapeChunkInfo {
                id: 13,
                name: "ramp-s2-ed".to_string(),
                walkable: false,
            },
            GameMapLandscapeChunkInfo {
                id: 14,
                name: "ramp-s2-eu".to_string(),
                walkable: false,
            },
            GameMapLandscapeChunkInfo {
                id: 15,
                name: "w-edge-s1".to_string(),
                walkable: false,
            },
            GameMapLandscapeChunkInfo {
                id: 16,
                name: "w-edge-s2".to_string(),
                walkable: false,
            },
            GameMapLandscapeChunkInfo {
                id: 17,
                name: "w-edge-in-s1".to_string(),
                walkable: false,
            },
            GameMapLandscapeChunkInfo {
                id: 18,
                name: "w-edge-in-s2".to_string(),
                walkable: false,
            },
            GameMapLandscapeChunkInfo {
                id: 19,
                name: "w-edge-out-s1".to_string(),
                walkable: false,
            },
            GameMapLandscapeChunkInfo {
                id: 20,
                name: "w-edge-out-s2".to_string(),
                walkable: false,
            },
            GameMapLandscapeChunkInfo {
                id: 21,
                name: "w2-edge".to_string(),
                walkable: false,
            },
            GameMapLandscapeChunkInfo {
                id: 22,
                name: "w2-edge-in".to_string(),
                walkable: false,
            },
            GameMapLandscapeChunkInfo {
                id: 23,
                name: "w2-edge-out".to_string(),
                walkable: false,
            },
            GameMapLandscapeChunkInfo {
                id: 24,
                name: "w3-edge".to_string(),
                walkable: false,
            },
            GameMapLandscapeChunkInfo {
                id: 25,
                name: "w3-edge-in".to_string(),
                walkable: false,
            },
            GameMapLandscapeChunkInfo {
                id: 26,
                name: "w3-edge-out".to_string(),
                walkable: false,
            },
        ],
    };
}
