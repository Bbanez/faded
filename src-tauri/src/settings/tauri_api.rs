use crate::{
    state::AppState,
    util::{math::USize, tauri_api_response::TauriResponse},
};

use super::models::main::Settings;

#[tauri::command]
pub fn settings_get(state: tauri::State<AppState>, resolution: USize) -> TauriResponse<Settings> {
    let mut state_guard = state.0.lock().unwrap();
    if state_guard.settings_repo.item.resolution.width > 0
        && state_guard.settings_repo.item.resolution.height > 0
    {
        return TauriResponse::new(state_guard.settings_repo.item.clone());
    } else {
        state_guard.settings_repo.update(resolution);
        return TauriResponse::new(state_guard.settings_repo.item.clone());
    }
}

#[tauri::command]
pub fn settings_set(state: tauri::State<AppState>, resolution: USize) -> TauriResponse<Settings> {
    let mut state_guard = state.0.lock().unwrap();
    state_guard.settings_repo.update(resolution);
    TauriResponse::new(state_guard.settings_repo.item.clone())
}
