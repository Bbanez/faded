use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::game::data::character::Character;
use crate::game::data::character::demo::CHARACTER_DEMO;
use crate::game::data::maps::demo::MAP_DEMO;
use crate::game::data::maps::Map;
use crate::response::TauriResponse;

pub mod character;
pub mod maps;

const MAPS: [Map; 1] = [MAP_DEMO];
const CHARACTERS: [Character; 1] = [CHARACTER_DEMO];

pub struct Data {}

impl Data {
    pub fn find_map_by_id(id: String) -> Option<Map> {
        MAPS.iter().cloned().find(|e| e.id == id)
    }

    pub fn find_character_by_id(id: String) -> Option<Character> {
        CHARACTERS.iter().cloned().find(|e| e.id == id)
    }
}

#[tauri::command]
pub fn data_maps() -> TauriResponse<[Map; 1]> {
    TauriResponse::new(MAPS)
}

#[tauri::command]
pub fn data_characters() -> TauriResponse<[Character; 1]> {
    TauriResponse::new(CHARACTERS)
}
