// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

pub mod account;
pub mod db;
pub mod game;
pub mod game_map;
pub mod hero;
pub mod path_finder;
pub mod settings;
pub mod util;

pub mod state;

use std::sync::Mutex;

use actix_web::{get, HttpResponse, Responder};

use account::repo::create_account_repo;
use account::tauri_api::{
    account_all, account_create, account_get_active, account_get_by_username, account_load,
};

use game::repo::create_game_repo;
use game::tauri_api::{game_create, game_get, game_get_all, game_on_tick, game_player_move};
use game_map::repo::create_game_map_repo;
use game_map::tauri_api::{
    game_map_create, game_map_get, game_map_get_all, game_map_landscape_get_sets,
    game_map_landscape_set_camera, game_map_landscape_set_chunk,
    game_map_landscape_set_selected_level, game_map_nav_mesh_metadata, game_map_path_find,
    game_map_save,
};

use path_finder::tauri_api::path_finder_a_star;
use settings::repo::create_settings_repo;
use settings::tauri_api::{settings_get, settings_set};

// use character::tauri_api::{character_get, character_get_all};
use hero::tauri_api::{hero_get, hero_get_all};

#[tauri::command]
fn report_error(err: &str) {
    println!("FRErr: {}", err);
}

#[get("/")]
async fn hello() -> impl Responder {
    HttpResponse::Ok().body("Hello world!")
}

fn main() {
    tauri::Builder::default()
        // .setup(|app| {
        //     let handler = app.handle();
        //     let boxed_handler = Box::new(handler);
        //     thread::spawn(move || {
        //         server::init(*boxed_handler).unwrap();
        //     });
        //     Ok(())
        // })
        .manage(state::AppState(Mutex::new(state::State {
            account_repo: create_account_repo(),
            settings_repo: create_settings_repo(),
            game_map_repo: create_game_map_repo(),
            game_repo: create_game_repo(),
        })))
        .invoke_handler(tauri::generate_handler![
            report_error,
            //
            account_create,
            account_load,
            account_get_active,
            account_all,
            account_get_by_username,
            //
            settings_get,
            settings_set,
            //
            game_map_save,
            game_map_nav_mesh_metadata,
            game_map_landscape_set_selected_level,
            game_map_landscape_set_chunk,
            game_map_landscape_set_camera,
            game_map_landscape_get_sets,
            game_map_get_all,
            game_map_get,
            game_map_create,
            game_map_path_find,
            //
            // character_get_all,
            // character_get,
            //
            hero_get_all,
            hero_get,
            //
            game_get_all,
            game_get,
            game_create,
            game_player_move,
            game_on_tick,
            //
            path_finder_a_star,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
