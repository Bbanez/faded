// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::Mutex;
use std::thread;

use actix_web::{get, HttpResponse, Responder};

use bcms::entry::{
    fdd_character::{FDD_CHARACTER_META_ITEMS, FddCharacterEntryMetaItem},
    fdd_enemy::{FDD_ENEMY_META_ITEMS, FddEnemyEntryMetaItem},
    fdd_map::FddMapEntryMetaItem,
};
use game::{
    map_info::map_info_set,
    on_tick::on_tick,
    player::{player_get, player_load, player_motion, player_set_wanted_position},
};
use models::{
    account::{Account, account_all, account_create, account_get_active, account_load},
    settings::{settings_get, settings_set}};
use storage::Storage;

use crate::bcms::entry::fdd_map::FDD_MAP_META_ITEMS;
use crate::game::size::{Size, USize};

pub mod bcms;
pub mod game;
pub mod models;
pub mod state;
pub mod storage;
mod server;

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
    let maps: Vec<FddMapEntryMetaItem> = serde_json::from_str(FDD_MAP_META_ITEMS).unwrap();
    let characters: Vec<FddCharacterEntryMetaItem> =
        serde_json::from_str(FDD_CHARACTER_META_ITEMS).unwrap();
    let enemies_data: Vec<FddEnemyEntryMetaItem> =
        serde_json::from_str(FDD_ENEMY_META_ITEMS).unwrap();
    let storage_data = Storage::read();
    let active_account: Option<Account>;
    let accounts;
    match storage_data.accounts {
        Some(accounts_str) => {
            accounts = serde_json::from_str(&accounts_str).unwrap();
        }
        None => {
            accounts = vec![];
        }
    }
    let settings;
    match storage_data.settings
    {
        Some(settings_str) => {
            settings = serde_json::from_str(&settings_str).unwrap();
        }
        None => {
            settings = None;
        }
    }
    match storage_data.active_account {
        Some(account_str) => {
            active_account = Some(serde_json::from_str(&account_str).unwrap());
        }
        None => active_account = None,
    }
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
            // nogo: game::nogo::Nogo::new(vec![], 0, 0, 0, 0),
            map_info: game::map_info::MapInfo::new(vec![], USize::new(0, 0), Size::new(0.0, 0.0)),
            maps,
            characters,
            enemies_data,
            projectiles: vec![],
            player: None,
            accounts,
            active_account,
            settings,
        })))
        .invoke_handler(tauri::generate_handler![
            report_error,

            player_load,
            player_motion,
            player_get,
            player_set_wanted_position,

            on_tick,

            map_info_set,

            account_create,
            account_load,
            account_get_active,
            account_all,

            settings_get,
            settings_set
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
