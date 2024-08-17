use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::util::math::{Point3, UPoint, USize3};

use super::landscape_chunk;

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export)]
pub struct GameMapLandscape {
    pub size: USize3,
    pub chunks: Vec<(u32, u32)>,
    pub camera_position: Point3,
    pub camera_rotation: f32,
    pub camera_d: f32,
    pub camera_speed: f32,
    pub selected_level: usize,
    pub start_position: UPoint,
}

impl GameMapLandscape {
    pub fn new_empty() -> GameMapLandscape {
        GameMapLandscape {
            camera_d: 0.0,
            camera_position: Point3::new(0.0, 0.0, 0.0),
            camera_rotation: 0.0,
            camera_speed: 0.0,
            chunks: vec![],
            selected_level: 0,
            size: USize3::new(0, 0, 0),
            start_position: UPoint::new(0, 0),
        }
    }

    pub fn new(
        size: USize3,
        camera_position: Point3,
        camera_rotation: f32,
        camera_d: f32,
        camera_speed: f32,
        selected_level: usize,
        start_position: UPoint,
    ) -> GameMapLandscape {
        let mut landscape = GameMapLandscape {
            size: size.clone(),
            chunks: vec![],
            camera_position,
            camera_rotation,
            camera_d,
            camera_speed,
            selected_level,
            start_position,
        };
        for y in 0..size.height as u32 {
            let mut mesh_id: u32 = 0;
            if y == 1 {
                mesh_id = 1;
            }
            for z in 0..size.depth as u32 {
                for x in 0..size.width as u32 {
                    let mut walkable = 0;
                    if mesh_id == 1 {
                        walkable = 1;
                    }
                    landscape.chunks.push(landscape_chunk::create(
                        mesh_id,
                        0,
                        x,
                        z,
                        y,
                        (0, 0),
                        0,
                        walkable,
                    ));
                }
            }
        }
        landscape
    }
}

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export)]
pub struct GameMapLandscapeLite {
    pub size: USize3,
    pub camera_position: Point3,
    pub camera_rotation: f32,
    pub camera_d: f32,
    pub camera_speed: f32,
    pub selected_level: usize,
    pub start_position: UPoint,
}

impl GameMapLandscapeLite {
    pub fn new_form_landscape(landscape: &GameMapLandscape) -> GameMapLandscapeLite {
        GameMapLandscapeLite {
            size: landscape.size.clone(),
            camera_position: landscape.camera_position.clone(),
            camera_rotation: landscape.camera_rotation,
            camera_d: landscape.camera_d,
            camera_speed: landscape.camera_speed,
            selected_level: landscape.selected_level,
            start_position: landscape.start_position.clone(),
        }
    }
}
