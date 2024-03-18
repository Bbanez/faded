use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::GameState;
use crate::models::model::Model;
use crate::storage::Storage;

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export)]
pub struct Settings {
    pub model: Model,
    pub resolution: (i32, i32),
}

impl Settings {
    pub fn new(resolution: (i32, i32)) -> Settings {
        Settings {
            model: Model::new(None),
            resolution,
        }
    }
}

#[tauri::command]
pub fn settings_get(state: tauri::State<GameState>, resolution: (i32, i32)) -> Settings {
    let mut state_guard = state.0.lock().unwrap();
    return match &state_guard.settings {
        Some(settings) => {
            settings.clone()
        }
        None => {
            let new_setting = Settings::new(resolution);
            state_guard.settings = Some(new_setting.clone());
            let mut storage_data = Storage::read();
            storage_data.settings = Some(serde_json::to_string(&state_guard.settings).unwrap());
            drop(state_guard);
            Storage::write(&storage_data);
            new_setting
        }
    };
}

#[tauri::command]
pub fn settings_set(state: tauri::State<GameState>, resolution: (i32, i32)) -> Settings {
    let mut state_guard = state.0.lock().unwrap();
    if let Some(ref mut settings) = state_guard.settings {
        settings.resolution = resolution;
        let mut storage_date = Storage::read();
        let settings_str = Some(serde_json::to_string(&settings).unwrap());
        storage_date.settings = settings_str;
        Storage::write(&storage_date);
        settings.clone()
    } else {
        let new_settings = Some(Settings::new(resolution));
        state_guard.settings = new_settings.clone();
        let mut storage_data = Storage::read();
        storage_data.settings = Some(serde_json::to_string(&new_settings).unwrap());
        drop(state_guard);
        Storage::write(&storage_data);
        new_settings.unwrap()
    }
}
