use serde::{Deserialize, Serialize};

use crate::GameState;
use crate::models::model::Model;
use crate::storage::Storage;

#[derive(Serialize, Deserialize, Debug, Clone)]
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
            Storage::set("settings", &serde_json::to_string(&state_guard.settings).unwrap());
            new_setting
        }
    };
}

#[tauri::command]
pub fn settings_set(state: tauri::State<GameState>, resolution: (i32, i32)) -> Settings {
    let mut state_guard = state.0.lock().unwrap();
    return match &mut state_guard.settings {
        Some(settings) => {
            settings.resolution = resolution;
            Storage::set("settings", &serde_json::to_string(&settings).unwrap());
            settings.clone()
        }
        None => {
            let new_settings = Some(Settings::new(resolution));
            state_guard.settings = new_settings.clone();
            Storage::set("settings", &serde_json::to_string(&state_guard.settings).unwrap());
            new_settings.unwrap()
        }
    };
}
