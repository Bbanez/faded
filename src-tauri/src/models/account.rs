use serde::{Deserialize, Serialize};

use crate::{storage::Storage, GameState};

use super::model::Model;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Account {
    pub model: Model,
    pub username: String,
}

impl Account {
    pub fn new(username: String) -> Account {
        Account {
            model: Model::new(None),
            username,
        }
    }

    pub fn find(accounts: &Vec<Account>, username: &str) -> Option<Account> {
        for i in 0..accounts.len() {
            if accounts[i].username == username {
                return Some(accounts[i].clone());
            }
        }
        None
    }
}

#[tauri::command]
pub fn account_create(state: tauri::State<GameState>, username: &str) -> Account {
    let mut state_guard = state.0.lock().unwrap();
    let existing_account = Account::find(&state_guard.accounts, username);
    match existing_account {
        Some(account) => return account,
        None => {
            let account = Account::new(username.to_string());
            state_guard.active_account = Some(account.clone());
            state_guard.accounts.push(account.clone());
            Storage::set(
                "active_account",
                serde_json::to_string(&account).unwrap().as_str(),
            );
            Storage::set(
                "accounts",
                serde_json::to_string(&state_guard.accounts)
                    .unwrap()
                    .as_str(),
            );
            return account;
        }
    }
}

#[tauri::command]
pub fn account_load(state: tauri::State<GameState>, username: &str) -> Option<Account> {
    let state_guard = state.0.lock().unwrap();
    Account::find(&state_guard.accounts, username)
}

#[tauri::command]
pub fn account_get_active(state: tauri::State<GameState>) -> Option<Account> {
    let state_guard = state.0.lock().unwrap();
    state_guard.active_account.clone()
}

#[tauri::command]
pub fn account_all(state: tauri::State<GameState>) -> Vec<Account> {
    let state_guard = state.0.lock().unwrap();
    state_guard.accounts.clone()
}
