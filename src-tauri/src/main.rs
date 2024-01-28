// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::Mutex;

use bcms::entry::{
    fdd_character::{FDD_CHARACTER_META_ITEMS, FddCharacterEntryMetaItem},
    fdd_enemy::{FDD_ENEMY_META_ITEMS, FddEnemyEntryMetaItem},
    fdd_map::FddMapEntryMetaItem,
};
use game::{
    nogo::nogo_set,
    object::BaseStats,
    on_tick::on_tick,
    player::{player_get, player_load, player_motion, player_set_wanted_position},
};
use models::{
    account::{Account, account_all, account_create, account_get_active, account_load},
    settings::{settings_get, settings_set}};
use storage::{
    Storage,
    storage_get,
    storage_set,
};

use crate::bcms::entry::fdd_map::FDD_MAP_META_ITEMS;

pub mod bcms;
pub mod db;
pub mod game;
pub mod models;
pub mod state;
pub mod storage;

pub struct GameState(pub Mutex<state::State>);

#[tauri::command]
fn report_error(err: &str) {
    println!("FRErr: {}", err);
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
            settings = vec![];
        }
    }
    match storage_data.active_account {
        Some(account_str) => {
            active_account = Some(serde_json::from_str(&account_str).unwrap());
        }
        None => active_account = None,
    }
    tauri::Builder::default()
        .manage(GameState(Mutex::new(state::State {
            nogo: game::nogo::Nogo::new(vec![], 0, 0, 0, 0),
            maps,
            characters,
            enemies_data,
            projectiles: vec![],
            player: game::player::Player::new(
                (100.0, 100.0),
                (4.0, 4.0),
                (3200.0, 3200.0),
                BaseStats::new(1.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0),
            ),
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

            nogo_set,

            account_create,
            account_load,
            account_get_active,
            account_all,

            storage_get,
            storage_set,

            settings_get,
            settings_set
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
