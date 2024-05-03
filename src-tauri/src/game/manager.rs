use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::{GameState, util};
use crate::game::data::Data;
use crate::game::nav_mesh::NavMesh;
use crate::game::player::Player;
use crate::game::point::Point;
use crate::game::size::{Size, USize};
use crate::models::account::Account;
use crate::response::TauriResponse;

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export)]
pub struct Manager {
    pub id: String,
    pub created_at: u128,
    pub updated_at: u128,
    pub player: Player,
    pub map_id: String,
    pub nav_mesh: NavMesh,
}

#[tauri::command]
pub fn manager_get(state: tauri::State<GameState>, manager_id: &str) -> TauriResponse<Manager> {
    let state_guard = state.0.lock().unwrap();
    match state_guard.manager.clone() {
        Some(manager) => {
            TauriResponse::new(manager)
        }
        None => {
            TauriResponse::new_error(
                400,
                "Game manager does not exist",
            )
        }
    }
}

#[tauri::command]
pub fn manager_create(state: tauri::State<GameState>, character_id: &str, map_id: &str, pixels: Vec<u8>) -> TauriResponse<Manager> {
    let mut state_guard = state.0.lock().unwrap();
    let map_opt = Data::find_map_by_id(map_id.to_string());
    return match map_opt {
        Some(map) => {
            let char_opt = Data::find_character_by_id(character_id.to_string());
            match char_opt {
                Some(char) => {
                    let account_opt = Account::find_active(&state_guard.accounts);
                    match account_opt {
                        Some(account) => {
                            let account_id = account.id.clone();
                            let player = Player::new(
                                account_id,
                                char,
                                Point::new(map.start_x, map.start_z),
                                Size::new(map.width, map.height),
                            );
                            let nav_mesh = NavMesh::new(
                                pixels,
                                USize::new(
                                    map.nogo.width,
                                    map.nogo.height,
                                ),
                                Size::new(
                                    map.width,
                                    map.height,
                                ),
                            );
                            let time = util::time::get_current_millis();
                            let manager = Manager {
                                id: util::id::generate(),
                                created_at: time,
                                updated_at: time,
                                player,
                                nav_mesh,
                                map_id: map.id.to_string(),
                            };
                            state_guard.manager = Some(manager.clone());
                            TauriResponse::new(manager)
                        }
                        None => {
                            TauriResponse::new_error(
                                404,
                                "No active account found",
                            )
                        }
                    }
                }
                None => {
                    TauriResponse::new_error(
                        404,
                        format!("Character with ID {} does not exist", character_id).as_str(),
                    )
                }
            }
        }
        None => {
            TauriResponse::new_error(
                404,
                format!("Map with ID {} does not exist", map_id).as_str(),
            )
        }
    };
}