use crate::util::tauri_api_response::TauriResponse;

use super::{data::get_characters, models::main::Character};

#[tauri::command]
pub fn character_get_all() -> TauriResponse<Vec<Character>> {
    TauriResponse::new(get_characters())
}

#[tauri::command]
pub fn character_get(id: &str) -> TauriResponse<Character> {
    let characters = get_characters();
    for i in 0..characters.len() {
        if characters[i].id == id {
            return TauriResponse::new(characters[i].clone());
        }
    }
    TauriResponse::new_error_string(404, format!("Character with ID {} does not exist", id))
}
