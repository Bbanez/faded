use serde::{Deserialize, Serialize};

use crate::GameState;
use crate::models::model::Model;
use crate::storage::Storage;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Settings {
    pub model: Model,
    pub resolution: (i32, i32),
    pub account_id: String,
}

impl Settings {
    pub fn new(resolution: (i32, i32), account_id: String) -> Settings {
        Settings {
            model: Model::new(None),
            resolution,
            account_id,
        }
    }

    pub fn find_by_account_id(settings: &[Settings], account_id: &str) -> Option<usize> {
        settings.iter().position(|setting| setting.account_id == account_id)
    }
}

#[tauri::command]
pub fn settings_get(state: tauri::State<GameState>, resolution: (i32, i32)) -> Settings {
    let mut state_guard = state.0.lock().unwrap();
    if let Some(active_account) = &state_guard.active_account {
        let account_id = &active_account.model.id;
        return match Settings::find_by_account_id(&state_guard.settings, account_id) {
            Some(idx) => {
                state_guard.settings[idx].clone()
            }
            None => {
                let new_setting = Settings::new(resolution, String::from(account_id));
                state_guard.settings.push(new_setting.clone());
                Storage::set("settings", &serde_json::to_string(&state_guard.settings).unwrap());
                new_setting
            }
        };
    } else {
        panic!("Missing active account for get settings")
    }
}

#[tauri::command]
pub fn settings_set(state: tauri::State<GameState>, resolution: (i32, i32)) -> Settings {
    let mut state_guard = state.0.lock().unwrap();
    if let Some(active_account) = &state_guard.active_account {
        let account_id = &active_account.model.id;
        return match Settings::find_by_account_id(&state_guard.settings, account_id) {
            Some(idx) => {
                state_guard.settings[idx].resolution = resolution;
                Storage::set("settings", &serde_json::to_string(&state_guard.settings).unwrap());
                state_guard.settings[idx].clone()
            }
            None => {
                let new_setting = Settings::new(resolution, String::from(account_id));
                state_guard.settings.push(new_setting.clone());
                Storage::set("settings", &serde_json::to_string(&state_guard.settings).unwrap());
                new_setting
            }
        };
    } else {
        panic!("Missing active account")
    }
}
