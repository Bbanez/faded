use serde::{Deserialize, Serialize};
use ts_rs::TS;

// use crate::game::data::landscapes::LandscapeSet;
// use crate::game::data::Data;
// use crate::game::point::{Point3, UPoint};
// use crate::game::size::USize3;
use crate::map_maker::chunk_64;
use crate::response::TauriResponse;
use crate::storage::Storage;
use crate::util::math::USize3;
use crate::{util, GameState};

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export)]
pub struct Landscape {
    pub id: String,
    pub created_at: u128,
    pub updated_at: u128,
    pub name: String,
    pub desc: String,
    pub size: USize3,
    pub chunks: Vec<(u32, u32)>,
    pub camera_position: Point3,
    pub camera_rotation: f32,
    pub camera_d: f32,
    pub camera_speed: f32,
    pub selected_level: usize,
    pub start_position: UPoint,
}

impl Landscape {
    pub fn new(
        name: String,
        desc: String,
        size: USize3,
        camera_position: Point3,
        camera_rotation: f32,
        camera_d: f32,
        camera_speed: f32,
        selected_level: usize,
        start_position: UPoint,
    ) -> Landscape {
        let time = util::time::get_current_millis();
        let id = util::id::generate();
        let mut landscape = Landscape {
            id,
            created_at: time,
            updated_at: time,
            name,
            desc,
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
                    landscape.chunks.push(chunk_64::create(
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
pub struct LandscapeLite {
    pub id: String,
    pub created_at: u128,
    pub updated_at: u128,
    pub name: String,
    pub desc: String,
    pub size: USize3,
    pub camera_position: Point3,
    pub camera_rotation: f32,
    pub camera_d: f32,
    pub camera_speed: f32,
    pub selected_level: usize,
    pub start_position: UPoint,
}

impl LandscapeLite {
    pub fn new_form_landscape(landscape: &Landscape) -> LandscapeLite {
        LandscapeLite {
            id: landscape.id.clone(),
            created_at: landscape.created_at,
            updated_at: landscape.updated_at,
            name: landscape.name.clone(),
            desc: landscape.desc.clone(),
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

#[tauri::command]
pub fn landscape_create(
    state: tauri::State<GameState>,
    name: &str,
    desc: &str,
    size: USize3,
) -> TauriResponse<Landscape> {
    let mut state_guard = state.0.lock().unwrap();
    let landscape = Landscape::new(
        name.to_string(),
        desc.to_string(),
        size,
        Point3::new(0.0, 0.0, 0.0),
        0.0,
        0.0,
        0.1,
        1,
        UPoint::new(0, 0),
    );
    state_guard.landscapes.push(landscape.clone());
    return TauriResponse::new(landscape);
}

#[tauri::command]
pub fn landscape_set_camera(
    state: tauri::State<GameState>,
    id: &str,
    position: Point3,
    rotation: f32,
    distance: f32,
    speed: f32,
) -> TauriResponse<Point3> {
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
    TauriResponse::new_error_string(404, format!("Landscape with ID '{}' does not exist", id))
}

#[tauri::command]
pub fn landscape_set_selected_level(
    state: tauri::State<GameState>,
    id: &str,
    level: usize,
) -> TauriResponse<usize> {
    let mut state_guard = state.0.lock().unwrap();
    for i in 0..state_guard.landscapes.len() {
        if state_guard.landscapes[i].id == id {
            state_guard.landscapes[i].updated_at = util::time::get_current_millis();
            state_guard.landscapes[i].selected_level = level;
            return TauriResponse::new(level);
        }
    }
    TauriResponse::new_error_string(404, format!("Landscape with ID '{}' does not exist", id))
}

#[tauri::command]
pub fn landscape_update(
    state: tauri::State<GameState>,
    landscape: Landscape,
) -> TauriResponse<Landscape> {
    let mut state_guard = state.0.lock().unwrap();
    for i in 0..state_guard.landscapes.len() {
        if state_guard.landscapes[i].id == landscape.id {
            state_guard.landscapes[i].updated_at = util::time::get_current_millis();
            state_guard.landscapes[i].size = landscape.size;
            state_guard.landscapes[i].chunks = landscape.chunks;
            return TauriResponse::new(state_guard.landscapes[i].clone());
        }
    }
    TauriResponse::new_error_string(
        404,
        format!("Landscape with ID '{}' does not exist", landscape.id),
    )
}

#[tauri::command]
pub fn landscape_set_chunk(
    state: tauri::State<GameState>,
    id: &str,
    chunk_data: (u32, u32),
) -> TauriResponse<(u32, u32)> {
    let mut state_guard = state.0.lock().unwrap();
    for i in 0..state_guard.landscapes.len() {
        if state_guard.landscapes[i].id == id {
            state_guard.landscapes[i].updated_at = util::time::get_current_millis();
            let chunk_id = chunk_64::get_id(
                chunk_data,
                state_guard.landscapes[i].size.width as u32,
                state_guard.landscapes[i].size.depth as u32,
            ) as usize;
            state_guard.landscapes[i].chunks[chunk_id] = chunk_data;
            return TauriResponse::new(state_guard.landscapes[i].chunks[chunk_id].clone());
        }
    }
    TauriResponse::new_error_string(404, format!("Landscape with ID '{}' does not exist", id))
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
    TauriResponse::new_error_string(404, format!("Landscape with ID '{}' does not exist", id))
}

#[tauri::command]
pub fn landscape_get_all(state: tauri::State<GameState>) -> TauriResponse<Vec<LandscapeLite>> {
    let state_guard = state.0.lock().unwrap();
    return TauriResponse::new(
        state_guard
            .landscapes
            .iter()
            .map(|l| LandscapeLite::new_form_landscape(l))
            .collect(),
    );
}

#[tauri::command]
pub fn landscape_get_set_chunks(set_id: u32) -> TauriResponse<Vec<(u32, u32)>> {
    let landscape_set_opt = Data::find_landscape_by_id(set_id);
    match landscape_set_opt {
        Some(landscape_set) => TauriResponse::new(
            landscape_set
                .chunks
                .iter()
                .map(|c| {
                    let mut walkable: u32 = 0;
                    if c.walkable {
                        walkable = 1;
                    }
                    chunk_64::create(c.id, landscape_set.id, 0, 0, 0, (0, 0), 0, walkable)
                })
                .collect(),
        ),
        None => {
            return TauriResponse::new_error_string(
                404,
                format!("Landscape set '{}' does not exist", set_id),
            )
        }
    }
}

#[tauri::command]
pub fn landscape_get_sets() -> TauriResponse<Vec<LandscapeSet>> {
    TauriResponse::new(Data::landscape_sets())
}

#[tauri::command]
pub fn landscape_get_nav_map(
    state: tauri::State<GameState>,
    landscape_id: String,
) -> TauriResponse<Vec<u8>> {
    let state_guard = state.0.lock().unwrap();
    if let Some(landscape) = state_guard.landscapes.iter().find(|l| l.id == landscape_id) {
        let mut nav_map: Vec<u8> = vec![];
        for _ in 0..landscape.size.depth {
            for _ in 0..landscape.size.width {
                nav_map.push(0);
            }
        }
        for i in 0..landscape.chunks.len() {
            let chunk = landscape.chunks[i];
            let walkable = chunk_64::get_walkable(chunk);
            if walkable > 0 {
                let x = chunk_64::get_x_pos(chunk);
                let z = chunk_64::get_z_pos(chunk);
                let nav_map_id = x as usize + z as usize * landscape.size.width;
                nav_map[nav_map_id] = walkable as u8;
            }
        }
        return TauriResponse::new(nav_map);
    }
    TauriResponse::new_error_string(
        404,
        format!("Landscape with ID '{}' does not exist", landscape_id),
    )
}
