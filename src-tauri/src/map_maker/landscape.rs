/*
---- Socket ranges

- 1 - Invalid socket (air)
- 100k-200k - Symmetrical sockets (in plane)
- 200k-300k - Non-symmetrical sockets
 */

use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::{GameState, util};
use crate::game::data::Data;
use crate::game::data::landscapes::LandscapeSet;
use crate::game::point::{Point3, UPoint3};
use crate::game::size::USize3;
use crate::map_maker::index_transform::mat_to_vec;
use crate::response::TauriResponse;
use crate::storage::Storage;

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export)]
pub struct LandscapeChunk {
    id: usize,
    // To which set this chunk belongs to
    pub set_id: usize,
    pub set_name: String,
    // Name of the mesh for this chunk
    pub mesh: String,
    pub rotation: usize,
    pub mirror: (i8, i8),
    pub position: UPoint3,
}

// pub fn chunks_from_buffer(buf: &Vec<usize>) -> Vec<LandscapeChunk> {
//     let mut output: Vec<LandscapeChunk> = vec![];
//     let mut i: usize = 0;
//     while i < buf.len() {
//         output.push(LandscapeChunk {
//             id: buf[i],
//             set_id: buf[i + 1],
//             mesh_id: buf[i + 2],
//             rotation: buf[i + 3],
//             mirror: (
//                 buf[i + 4] as i8 - 1,
//                 buf[i + 5] as i8 - 1
//             ),
//             position: UPoint3::new(
//                 buf[i + 6],
//                 buf[i + 7],
//                 buf[i + 8],
//             ),
//         });
//         i += 9;
//     }
//     output
// }

// pub fn chunks_to_buffer(chunks: &Vec<LandscapeChunk>) -> Vec<usize> {
//     let mut output: Vec<usize> = vec![];
//     for i in 0..chunks.len() {
//         output.push(chunks[i].id);
//         output.push(chunks[i].set_id);
//         output.push(chunks[i].mesh_id);
//         output.push(chunks[i].rotation);
//         output.push((chunks[i].mirror.0 + 1) as usize);
//         output.push((chunks[i].mirror.1 + 1) as usize);
//         output.push(chunks[i].position.x);
//         output.push(chunks[i].position.y);
//         output.push(chunks[i].position.z);
//     }
//     output
// }

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export)]
pub struct LandscapeLevel {
    chunks: Vec<LandscapeChunk>,
}

// #[derive(Serialize, Deserialize, Debug, Clone, TS)]
// #[ts(export)]
// pub struct LandscapeLevel {
//     chunks: Vec<usize>,
// }

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export)]
pub struct Landscape {
    id: String,
    created_at: u128,
    updated_at: u128,
    name: String,
    desc: String,
    size: USize3,
    levels: Vec<LandscapeLevel>,
    camera_position: Point3,
    camera_rotation: f32,
    camera_d: f32,
    camera_speed: f32,
    selected_level: usize,
}

impl Landscape {
    pub fn new(name: String, desc: String, size: USize3, camera_position: Point3, camera_rotation: f32, camera_d: f32, camera_speed: f32, selected_level: usize) -> Landscape {
        let time = util::time::get_current_millis();
        let id = util::id::generate();
        let mut landscape = Landscape {
            id,
            created_at: time,
            updated_at: time,
            name,
            desc,
            size: size.clone(),
            levels: vec![],
            camera_position,
            camera_rotation,
            camera_d,
            camera_speed,
            selected_level,
        };
        let mut chunks: Vec<LandscapeChunk> = vec![];
        for z in 0..size.depth {
            for x in 0..size.width {
                chunks.push(LandscapeChunk {
                    id: mat_to_vec(x, z, size.width),
                    set_id: 0,
                    set_name: "demo".to_string(),
                    // mesh_id: 0,
                    mesh: "air".to_string(),
                    mirror: (1, 1),
                    rotation: 0,
                    position: UPoint3::new(x, 0, z),
                })
            }
        }
        // let chunk_buf = chunks_to_buffer(&chunks);
        for _ in 0..size.height {
            landscape.levels.push(LandscapeLevel {
                // chunks: chunk_buf.clone(),
                chunks: chunks.clone(),
            });
        }
        landscape
    }
}

#[tauri::command]
pub fn landscape_create(state: tauri::State<GameState>, name: &str, desc: &str, size: USize3) -> TauriResponse<Landscape> {
    let mut state_guard = state.0.lock().unwrap();
    let landscape = Landscape::new(
        name.to_string(),
        desc.to_string(),
        size,
        Point3::new(0.0, 0.0, 0.0),
        0.0,
        0.0,
        0.1,
        0,
    );
    state_guard.landscapes.push(landscape.clone());
    return TauriResponse::new(landscape);
}

#[tauri::command]
pub fn landscape_set_camera(state: tauri::State<GameState>, id: &str, position: Point3, rotation: f32, distance: f32, speed: f32) -> TauriResponse<Point3> {
    let mut state_guard = state.0.lock().unwrap();
    for i in 0..state_guard.landscapes.len() {
        if state_guard.landscapes[i].id == id {
            state_guard.landscapes[i].updated_at = util::time::get_current_millis();
            state_guard.landscapes[i].camera_position = position.clone();
            state_guard.landscapes[i].camera_rotation = rotation;
            state_guard.landscapes[i].camera_d = distance;
            state_guard.landscapes[i].camera_speed = speed;
            return TauriResponse::new(position);
        }
    }
    TauriResponse::new_error_string(
        404,
        format!("Landscape with ID '{}' does not exist", id),
    )
}

#[tauri::command]
pub fn landscape_set_selected_level(state: tauri::State<GameState>, id: &str, level: usize) -> TauriResponse<usize> {
    let mut state_guard = state.0.lock().unwrap();
    for i in 0..state_guard.landscapes.len() {
        if state_guard.landscapes[i].id == id {
            state_guard.landscapes[i].updated_at = util::time::get_current_millis();
            state_guard.landscapes[i].selected_level = level;
            return TauriResponse::new(level);
        }
    }
    TauriResponse::new_error_string(
        404,
        format!("Landscape with ID '{}' does not exist", id),
    )
}

#[tauri::command]
pub fn landscape_update(state: tauri::State<GameState>, landscape: Landscape) -> TauriResponse<Landscape> {
    let mut state_guard = state.0.lock().unwrap();
    for i in 0..state_guard.landscapes.len() {
        if state_guard.landscapes[i].id == landscape.id {
            state_guard.landscapes[i].updated_at = util::time::get_current_millis();
            state_guard.landscapes[i].size = landscape.size;
            state_guard.landscapes[i].levels = landscape.levels;
            return TauriResponse::new(state_guard.landscapes[i].clone());
        }
    }
    TauriResponse::new_error_string(
        404,
        format!("Landscape with ID '{}' does not exist", landscape.id),
    )
}

#[tauri::command]
pub fn landscape_set_chunk(state: tauri::State<GameState>, id: &str, level_idx: usize, chunk_idx: usize, chunk: LandscapeChunk) -> TauriResponse<LandscapeChunk> {
    let mut state_guard = state.0.lock().unwrap();
    for i in 0..state_guard.landscapes.len() {
        if state_guard.landscapes[i].id == id {
            state_guard.landscapes[i].updated_at = util::time::get_current_millis();
            state_guard.landscapes[i].levels[level_idx].chunks[chunk_idx] = chunk;
            return TauriResponse::new(state_guard.landscapes[i].levels[level_idx].chunks[chunk_idx].clone());
        }
    }
    TauriResponse::new_error_string(
        404,
        format!("Landscape with ID '{}' does not exist", id),
    )
}

#[tauri::command]
pub fn landscape_save(state: tauri::State<GameState>) -> TauriResponse<Vec<Landscape>> {
    let state_guard = state.0.lock().unwrap();
    let mut storage_date = Storage::read();
    let landscapes_str = Some(serde_json::to_string(&state_guard.landscapes).unwrap());
    storage_date.landscapes = landscapes_str;
    Storage::write(&storage_date);
    return TauriResponse::new(state_guard.landscapes.clone());
}

#[tauri::command]
pub fn landscape_get(state: tauri::State<GameState>, id: &str) -> TauriResponse<Landscape> {
    let state_guard = state.0.lock().unwrap();
    if let Some(landscape) = state_guard.landscapes.iter().find(|l| l.id == id) {
        return TauriResponse::new(landscape.clone());
    }
    TauriResponse::new_error_string(
        404,
        format!("Landscape with ID '{}' does not exist", id),
    )
}

#[tauri::command]
pub fn landscape_get_all(state: tauri::State<GameState>) -> TauriResponse<Vec<Landscape>> {
    let state_guard = state.0.lock().unwrap();
    return TauriResponse::new(state_guard.landscapes.clone());
}

#[tauri::command]
pub fn landscape_get_set_chunks(set_name: &str) -> TauriResponse<Vec<LandscapeChunk>> {
    let dic = Data::find_landscape_by_name(set_name.to_string()).unwrap();
    return if set_name == "demo" {
        TauriResponse::new(
            dic.chunks.iter().map(|c| LandscapeChunk {
                id: c.id,
                set_id: dic.id,
                set_name: set_name.to_string(),
                rotation: c.rotation,
                mirror: (1, 1),
                mesh: c.name.to_string(),
                position: UPoint3::new(0, 0, 0),
            }).collect()
        )
    } else {
        TauriResponse::new_error_string(
            404,
            format!("Landscape set '{}' does not exist", set_name),
        )
    };
}

#[tauri::command]
pub fn landscape_get_sets() -> TauriResponse<Vec<LandscapeSet>> {
    TauriResponse::new(Data::landscape_sets())
}
