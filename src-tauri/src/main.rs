// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::Mutex;

use bcms::entry::{
    fdd_character::{FddCharacterEntryMetaItem, FDD_CHARACTER_META_ITEMS},
    fdd_enemy::{FddEnemyEntryMetaItem, FDD_ENEMY_META_ITEMS},
    fdd_map::FddMapEntryMetaItem,
};
use game::object::BaseStats;
use models::account::Account;
use storage::Storage;

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
    println!("{:?}", storage_data);
    let accounts: Vec<Account>;
    let active_account: Option<Account>;
    match storage_data.accounts {
        Some(accounts_str) => {
            accounts = serde_json::from_str(&accounts_str).unwrap();
        }
        None => {
            accounts = vec![];
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
        })))
        .invoke_handler(tauri::generate_handler![
            report_error,
            game::player::player_load,
            game::player::player_motion,
            game::player::player_get,
            game::player::player_set_wanted_position,
            game::on_tick::on_tick,
            game::nogo::nogo_set,
            models::account::account_create,
            models::account::account_load,
            models::account::account_get_active,
            models::account::account_all
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
