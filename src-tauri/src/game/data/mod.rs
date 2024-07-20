use crate::game::data::characters::Character;
use crate::game::data::characters::demo::CHARACTER_DEMO;
use crate::game::data::enemies::demo::ENEMY_DEMO;
use crate::game::data::enemies::EnemyData;
use crate::game::data::landscapes::demo::LANDSCAPE_DEMO;
use crate::game::data::landscapes::LandscapeSet;
use crate::game::data::maps::demo::MAP_DEMO;
use crate::game::data::maps::Map;
use crate::response::TauriResponse;

pub mod characters;
pub mod maps;
pub mod enemies;
pub mod landscapes;

const MAPS: [Map; 1] = [MAP_DEMO];
const CHARACTERS: [Character; 1] = [CHARACTER_DEMO];
const ENEMIES: [EnemyData; 1] = [ENEMY_DEMO];
const LANDSCAPES: [LandscapeSet; 1] = [LANDSCAPE_DEMO];

pub struct Data {}

impl Data {
    pub fn find_map_by_id(id: String) -> Option<Map> {
        MAPS.iter().cloned().find(|e| e.id == id)
    }

    pub fn find_character_by_id(id: String) -> Option<Character> {
        CHARACTERS.iter().cloned().find(|e| e.id == id)
    }

    pub fn find_landscape_by_id(id: u32) -> Option<LandscapeSet> {
        LANDSCAPES.iter().cloned().find(|e| e.id == id)
    }

    pub fn find_landscape_by_name(name: String) -> Option<LandscapeSet> {
        LANDSCAPES.iter().cloned().find(|e| e.name == name)
    }

    pub fn landscape_sets() -> Vec<LandscapeSet> {
        let mut output: Vec<LandscapeSet> = vec![];
        for i in 0..LANDSCAPES.len() {
            output.push(LANDSCAPES[i].clone())
        }
        output
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
