// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::Mutex;
use std::thread;

use actix_web::{get, HttpResponse, Responder};

use game::{
    data::{data_characters, data_maps},
    manager::{manager_create, manager_get},
    on_tick::on_tick,
    player::{player_get, player_motion, player_set_wanted_position},
};
use map_maker::landscape::{
    landscape_create, landscape_get, landscape_get_all, landscape_get_nav_map,
    landscape_get_set_chunks, landscape_get_sets, landscape_save, landscape_set_camera,
    landscape_set_chunk, landscape_set_selected_level, landscape_update,
};
use models::{
    account::{
        account_all, account_create, account_get_active, account_get_by_username, account_load,
    },
    settings::{settings_get, settings_set},
};
use storage::Storage;

pub mod bcms;
pub mod game;
pub mod map_maker;
pub mod models;
pub mod response;
pub mod server;
pub mod state;
pub mod storage;
pub mod util;

pub struct GameState(pub Mutex<state::State>);

#[tauri::command]
fn report_error(err: &str) {
    println!("FRErr: {}", err);
}

#[get("/")]
async fn hello() -> impl Responder {
    HttpResponse::Ok().body("Hello world!")
}

fn main() {
    let storage_data = Storage::read_unpacked();
    tauri::Builder::default()
        .setup(|app| {
            let handler = app.handle();
            let boxed_handler = Box::new(handler);
            thread::spawn(move || {
                server::init(*boxed_handler).unwrap();
            });
            Ok(())
        })
        .manage(GameState(Mutex::new(state::State {
            manager: None,
            accounts: storage_data.accounts,
            settings: storage_data.settings,
            landscapes: storage_data.landscapes,
        })))
        .invoke_handler(tauri::generate_handler![
            report_error,
            player_motion,
            player_get,
            player_set_wanted_position,
            on_tick,
            account_create,
            account_load,
            account_get_active,
            account_all,
            account_get_by_username,
            settings_get,
            settings_set,
            data_maps,
            data_characters,
            manager_create,
            manager_get,
            landscape_get_set_chunks,
            landscape_create,
            landscape_get,
            landscape_save,
            landscape_update,
            landscape_get_all,
            landscape_get_sets,
            landscape_set_chunk,
            landscape_set_camera,
            landscape_set_selected_level,
            landscape_get_nav_map,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
