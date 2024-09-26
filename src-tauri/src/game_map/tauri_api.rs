use super::{
    data::{landscape_set_demo::get_game_map_landscape_sets, GameMapLandscapeSet},
    models::{
        landscape::GameMapLandscape,
        landscape_chunk,
        main::{GameMap, GameMapLite},
    },
};
use crate::path_finder::main::a_star;
use crate::util::math::Point;
use crate::{
    state::AppState,
    util::{
        self,
        math::{Point3, UPoint, USize3},
        tauri_api_response::TauriResponse,
    },
};

#[tauri::command]
pub fn game_map_create(
    state: tauri::State<AppState>,
    name: &str,
    desc: &str,
    size: USize3,
) -> TauriResponse<GameMap> {
    let mut state_guard = state.0.lock().unwrap();
    let game_map = state_guard.game_map_repo.add(GameMap::new(
        name.to_string(),
        desc.to_string(),
        None,
        GameMapLandscape::new(
            size,
            Point3::new(0.0, 0.0, 0.0),
            0.0,
            0.0,
            0.1,
            1,
            UPoint::new(0, 0),
        ),
        Point3::new(1.0, 1.0, 1.0),
    ));
    match game_map {
        Ok(game_map) => TauriResponse::new(game_map),
        Err(err) => {
            println!("{}", err);
            TauriResponse::new_error(500, "Failed to create a game map")
        }
    }
}

#[tauri::command]
pub fn game_map_save(state: tauri::State<AppState>, game_map_id: &str) -> TauriResponse<GameMap> {
    let mut state_guard = state.0.lock().unwrap();
    for i in 0..state_guard.game_map_repo.items.len() {
        if state_guard.game_map_repo.items[i].id == game_map_id {
            let game_map = state_guard.game_map_repo.items[i].clone();
            let game_map = state_guard.game_map_repo.update(game_map);
            return match game_map {
                Ok(game_map) => TauriResponse::new(game_map),
                Err(err) => {
                    println!("{}", err);
                    TauriResponse::new_error(500, "Failed to create a game map")
                }
            };
        }
    }
    TauriResponse::new_error_string(
        404,
        format!("Game map with ID '{}' does not exist", game_map_id),
    )
}

#[tauri::command]
pub fn game_map_get(state: tauri::State<AppState>, game_map_id: &str) -> TauriResponse<GameMap> {
    let state_guard = state.0.lock().unwrap();
    if let Some(game_map) = state_guard
        .game_map_repo
        .items
        .iter()
        .find(|l| l.id == game_map_id)
    {
        return TauriResponse::new(game_map.clone());
    }
    TauriResponse::new_error_string(
        404,
        format!("Game map with ID '{}' does not exist", game_map_id),
    )
}

#[tauri::command]
pub fn game_map_get_all(state: tauri::State<AppState>) -> TauriResponse<Vec<GameMapLite>> {
    let state_guard = state.0.lock().unwrap();
    TauriResponse::new(
        state_guard
            .game_map_repo
            .items
            .iter()
            .map(|m| GameMapLite::new_from_game_map(m))
            .collect(),
    )
}

#[tauri::command]
pub fn game_map_landscape_set_camera(
    state: tauri::State<AppState>,
    game_map_id: &str,
    camera_position: Point3,
    camera_rotation: f32,
    camera_distance: f32,
    camera_speed: f32,
) -> TauriResponse<Point3> {
    let mut state_guard = state.0.lock().unwrap();
    for i in 0..state_guard.game_map_repo.items.len() {
        if state_guard.game_map_repo.items[i].id == game_map_id {
            state_guard.game_map_repo.items[i].updated_at = util::time::get_current_millis();
            state_guard.game_map_repo.items[i].landscape.camera_position = camera_position.clone();
            state_guard.game_map_repo.items[i].landscape.camera_rotation = camera_rotation;
            state_guard.game_map_repo.items[i].landscape.camera_d = camera_distance;
            state_guard.game_map_repo.items[i].landscape.camera_speed = camera_speed;
            return TauriResponse::new(camera_position);
        }
    }
    TauriResponse::new_error_string(
        404,
        format!("Game map with ID '{}' does not exist", game_map_id),
    )
}

#[tauri::command]
pub fn game_map_landscape_set_selected_level(
    state: tauri::State<AppState>,
    game_map_id: &str,
    level: usize,
) -> TauriResponse<usize> {
    let mut state_guard = state.0.lock().unwrap();
    for i in 0..state_guard.game_map_repo.items.len() {
        if state_guard.game_map_repo.items[i].id == game_map_id {
            state_guard.game_map_repo.items[i].updated_at = util::time::get_current_millis();
            state_guard.game_map_repo.items[i].landscape.selected_level = level;
            return TauriResponse::new(level);
        }
    }
    TauriResponse::new_error_string(
        404,
        format!("Game map with ID '{}' does not exist", game_map_id),
    )
}

#[tauri::command]
pub fn game_map_landscape_set_chunk(
    state: tauri::State<AppState>,
    game_map_id: &str,
    chunk_data: (u32, u32),
) -> TauriResponse<(u32, u32)> {
    let mut state_guard = state.0.lock().unwrap();
    for i in 0..state_guard.game_map_repo.items.len() {
        if state_guard.game_map_repo.items[i].id == game_map_id {
            state_guard.game_map_repo.items[i].updated_at = util::time::get_current_millis();
            let chunk_id = landscape_chunk::get_id(
                chunk_data,
                state_guard.game_map_repo.items[i].landscape.size.width as u32,
                state_guard.game_map_repo.items[i].landscape.size.depth as u32,
            ) as usize;
            state_guard.game_map_repo.items[i].landscape.chunks[chunk_id] = chunk_data;
            return TauriResponse::new(
                state_guard.game_map_repo.items[i].landscape.chunks[chunk_id].clone(),
            );
        }
    }
    TauriResponse::new_error_string(
        404,
        format!("Game map with ID '{}' does not exist", game_map_id),
    )
}

#[tauri::command]
pub fn game_map_landscape_get_sets() -> TauriResponse<Vec<GameMapLandscapeSet>> {
    TauriResponse::new(get_game_map_landscape_sets())
}

#[tauri::command]
pub fn game_map_nav_mesh_metadata(
    state: tauri::State<AppState>,
    game_map_id: String,
) -> TauriResponse<Vec<u8>> {
    let state_guard = state.0.lock().unwrap();
    if let Some(game_map) = state_guard
        .game_map_repo
        .items
        .iter()
        .find(|l| l.id == game_map_id)
    {
        return TauriResponse::new(game_map.get_nav_mesh());
    }
    TauriResponse::new_error_string(
        404,
        format!("Game map with ID '{}' does not exist", game_map_id),
    )
}

#[tauri::command]
pub fn game_map_path_find(
    state: tauri::State<AppState>,
    start: Point,
    end: Point,
    map_id: &str,
) -> TauriResponse<Vec<UPoint>> {
    let state_guard = state.0.lock().unwrap();
    let game_map_opt = state_guard.game_map_repo.find_by_id(map_id.to_string());
    match game_map_opt {
        Some(game_map) => {
            let nav_mesh = game_map.get_nav_mesh();
            let start_norm = start.to_u_point();
            let end_norm = end.to_u_point();
            let result = a_star(
                &start_norm,
                &end_norm,
                &nav_mesh,
                &game_map.landscape.size.to_u2(),
            );
            match result.0 {
                Some(path) => TauriResponse::new(path),
                None => TauriResponse::new_error(404, "No path found"),
            }
        }
        None => TauriResponse::new_error_string(
            404,
            format!("Game map with ID '{}' does not exist", map_id),
        ),
    }
}
