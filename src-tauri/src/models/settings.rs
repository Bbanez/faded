use serde::{Deserialize, Serialize};
use ts_rs::TS;
use crate::game::size::USize;

use crate::{GameState, util};
use crate::response::TauriResponse;
use crate::storage::Storage;

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export)]
pub struct Settings {
    pub id: String,
    pub created_at: u128,
    pub updated_at: u128,
    pub resolution: USize,
}

impl Settings {
    pub fn new(resolution: USize) -> Settings {
        let time = util::time::get_current_millis();
        let id = util::id::generate();
        Settings {
            id,
            created_at: time,
            updated_at: time,
            resolution,
        }
    }
}

#[tauri::command]
pub fn settings_get(state: tauri::State<GameState>, resolution: USize) -> TauriResponse<Settings> {
    let mut state_guard = state.0.lock().unwrap();
    return match &state_guard.settings {
        Some(settings) => {
            TauriResponse::new(settings.clone())
        }
        None => {
            let new_setting = Settings::new(resolution);
            state_guard.settings = Some(new_setting.clone());
            let mut storage_data = Storage::read();
            storage_data.settings = Some(serde_json::to_string(&state_guard.settings).unwrap());
            drop(state_guard);
            Storage::write(&storage_data);
            TauriResponse::new(new_setting)
        }
    };
}

#[tauri::command]
pub fn settings_set(state: tauri::State<GameState>, resolution: USize) -> TauriResponse<Settings> {
    let mut state_guard = state.0.lock().unwrap();
    if let Some(ref mut settings) = state_guard.settings {
        settings.resolution = resolution.clone();
        let mut storage_date = Storage::read();
        let settings_str = Some(serde_json::to_string(&settings).unwrap());
        storage_date.settings = settings_str;
        Storage::write(&storage_date);
        TauriResponse::new(settings.clone())
    } else {
        let new_settings = Some(Settings::new(resolution));
        state_guard.settings = new_settings.clone();
        let mut storage_data = Storage::read();
        storage_data.settings = Some(serde_json::to_string(&new_settings).unwrap());
        drop(state_guard);
        Storage::write(&storage_data);
        TauriResponse::new(new_settings.unwrap())
    }
}
