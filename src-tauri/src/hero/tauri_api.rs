use crate::util::tauri_api_response::TauriResponse;

use super::{data::get_heros, models::main::Hero};

#[tauri::command]
pub fn hero_get_all() -> TauriResponse<Vec<Hero>> {
    TauriResponse::new(get_heros())
}

#[tauri::command]
pub fn hero_get(id: &str) -> TauriResponse<Hero> {
    let heros = get_heros();
    for i in 0..heros.len() {
        if heros[i].id == id {
            return TauriResponse::new(heros[i].clone());
        }
    }
    TauriResponse::new_error_string(404, format!("Hero with ID {} does not exist", id))
}
