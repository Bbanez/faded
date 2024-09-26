use super::models::{main::Game, player::GamePlayer};
use crate::path_finder::main::a_star;
use crate::{
    hero::data::get_heros,
    state::AppState,
    util::{math::Point, tauri_api_response::TauriResponse},
};

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
        vec![GamePlayer::new(
            account_id.to_string(),
            hero,
            Point::new(
                game_map.hero_start_position.x,
                game_map.hero_start_position.z,
            ),
            0.0,
        )],
    );
    let game = state_guard.game_repo.add(game.clone());
    match game {
        Ok(g) => TauriResponse::new(g),
        Err(err) => {
            println!("{}", err);
            TauriResponse::new_error(500, "Failed to save game information")
        }
    }
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

#[tauri::command]
pub fn game_on_tick(state: tauri::State<AppState>, game_id: &str) -> TauriResponse<Game> {
    let mut state_guard = state.0.lock().unwrap();
    for i in 0..state_guard.game_repo.items.len() {
        if state_guard.game_repo.items[i].id == game_id {
            state_guard.game_repo.items[i].on_tick();
            return TauriResponse::new(state_guard.game_repo.items[i].clone());
        }
    }
    TauriResponse::new_error_string(404, format!("Game with ID {} does not exist", game_id))
}

#[tauri::command]
pub fn game_player_move(
    state: tauri::State<AppState>,
    game_id: &str,
    end: Point,
    player_idx: usize,
) -> TauriResponse<GamePlayer> {
    let mut state_guard = state.0.lock().unwrap();
    for i in 0..state_guard.game_repo.items.len() {
        if state_guard.game_repo.items[i].id != game_id {
            continue;
        }
        for j in 0..state_guard.game_map_repo.items.len() {
            if state_guard.game_map_repo.items[j].id != state_guard.game_repo.items[i].map_id {
                continue;
            }
            if player_idx >= state_guard.game_repo.items[i].players.len() {
                return TauriResponse::new_error_string(
                    500,
                    format!("Invalid player index provided: {}", player_idx),
                );
            }
            let nav_mesh = state_guard.game_map_repo.items[j].get_nav_mesh();
            let start_norm = state_guard.game_repo.items[i].players[player_idx]
                .bb
                .get_position()
                .to_u_point();
            let end_norm = end.to_u_point();
            let result = a_star(
                &start_norm,
                &end_norm,
                &nav_mesh,
                &state_guard.game_map_repo.items[j].landscape.size.to_u2(),
            );
            return match result.0 {
                Some(path) => {
                    state_guard.game_repo.items[i].players[player_idx].wps = vec![];
                    if result.1 {
                        state_guard.game_repo.items[i].players[player_idx]
                            .wps
                            .push(end.clone());
                    } else {
                        state_guard.game_repo.items[i].players[player_idx]
                            .wps
                            .push(path[path.len() - 1].clone().to_point())
                    }
                    TauriResponse::new(state_guard.game_repo.items[i].players[player_idx].clone())
                }
                None => TauriResponse::new_error(404, "No path found"),
            };
        }
    }
    TauriResponse::new_error_string(404, format!("Game with ID {} does not exist", game_id))
}
