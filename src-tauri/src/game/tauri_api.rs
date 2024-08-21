use crate::{hero::data::get_heros, state::AppState, util::tauri_api_response::TauriResponse};

use super::models::{main::Game, player::GamePlayer};

#[tauri::command]
pub fn game_create(
    state: tauri::State<AppState>,
    map_id: &str,
    account_id: &str,
    hero1_id: &str,
) -> TauriResponse<Game> {
    let mut state_guard = state.0.lock().unwrap();
    let heros = get_heros();
    let mut hero1_idx = 1000000;
    for i in 0..heros.len() {
        if heros[i].id == hero1_id {
            hero1_idx = i;
            break;
        }
    }
    if hero1_idx == 1000000 {
        return TauriResponse::new_error_string(
            404,
            format!("Hero with ID {} does not exist", hero1_id),
        );
    }
    let hero = heros[hero1_idx].clone();
    let mut game_map_idx = 1000000;
    for i in 0..state_guard.game_map_repo.items.len() {
        if state_guard.game_map_repo.items[i].id == map_id {
            game_map_idx = i;
            break;
        }
    }
    if game_map_idx == 1000000 {
        return TauriResponse::new_error_string(
            404,
            format!("Game map with ID {} does not exist", map_id),
        );
    }
    let game_map = state_guard.game_map_repo.items[game_map_idx].clone();
    let game = Game::new(
        map_id.to_string(),
        GamePlayer::new(account_id.to_string(), hero, game_map.hero_start_position),
    );
    let game = state_guard.game_repo.add(game.clone());
    return match game {
        Ok(g) => TauriResponse::new(g),
        Err(err) => {
            println!("{}", err);
            TauriResponse::new_error(500, "Failed to save game information")
        }
    };
}

#[tauri::command]
pub fn game_get(state: tauri::State<AppState>, game_id: &str) -> TauriResponse<Game> {
    let state_guard = state.0.lock().unwrap();
    for i in 0..state_guard.game_repo.items.len() {
        if state_guard.game_repo.items[i].id == game_id {
            return TauriResponse::new(state_guard.game_repo.items[i].clone());
        }
    }
    TauriResponse::new_error_string(404, format!("Game with ID {} does not exist", game_id))
}

#[tauri::command]
pub fn game_get_all(state: tauri::State<AppState>) -> TauriResponse<Vec<Game>> {
    let state_guard = state.0.lock().unwrap();
    TauriResponse::new(state_guard.game_repo.items.clone())
}
