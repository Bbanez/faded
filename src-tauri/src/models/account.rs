use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::{GameState, storage::Storage, util};
use crate::response::TauriResponse;

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export)]
pub struct Account {
    pub id: String,
    pub created_at: u128,
    pub updated_at: u128,
    pub username: String,
    pub active: bool,
}

impl Account {
    pub fn new(username: String) -> Account {
        let time = util::time::get_current_millis();
        let id = util::id::generate();
        Account {
            id,
            created_at: time,
            updated_at: time,
            username,
            active: false,
        }
    }

    pub fn find<'a>(accounts: &'a [Account], username: &str) -> Option<&'a Account> {
        accounts.iter().find(|account| account.username == username)
    }

    pub fn find_active(accounts: &[Account]) -> Option<&Account> {
        accounts.iter().find(|account| account.active == true)
    }

    pub fn set(accounts: &mut Vec<Account>, account: Account) -> &mut Vec<Account> {
        match accounts.iter().position(|acc| acc.username == account.username) {
            Some(position) => accounts[position] = account,
            None => accounts.push(account),
        }
        accounts
    }

    pub fn get_or_create(accounts: &mut Vec<Account>, username: &str) -> usize {
        match accounts.iter().position(|account| account.username == username) {
            Some(index) => index,
            None => {
                let account = Account::new(username.to_string());
                accounts.push(account);
                accounts.len() - 1
            }
        }
    }
}

#[tauri::command]
pub fn account_create(state: tauri::State<GameState>, username: &str) -> TauriResponse<Account> {
    let mut state_guard = state.0.lock().unwrap();
    for i in 0..state_guard.accounts.len() {
        state_guard.accounts[i].active = false;
    }
    let account_index = Account::get_or_create(&mut state_guard.accounts, username);
    state_guard.accounts[account_index].active = true;
    let account = state_guard.accounts[account_index].clone();

    let mut storage_data = Storage::read();
    storage_data.accounts = Some(serde_json::to_string(&state_guard.accounts).unwrap());
    drop(state_guard);  // explicit drop to release the lock asap
    Storage::write(&storage_data);
    TauriResponse::new(account)
}

#[tauri::command]
pub fn account_load(state: tauri::State<GameState>, username: &str) -> TauriResponse<Option<Account>> {
    let mut state_guard = state.0.lock().unwrap();
    // let accounts = state_guard.accounts.clone();
    let mut account_index: usize = 1000000;
    for i in 0..state_guard.accounts.len() {
        if state_guard.accounts[i].username == username {
            account_index = i;
            state_guard.accounts[i].active = true;
        } else {
            state_guard.accounts[i].active = false;
        }
    }
    return if account_index == 1000000 {
        TauriResponse::new(None)
    } else {
        let account = state_guard.accounts[account_index].clone();
        let mut storage_data = Storage::read();
        storage_data.accounts = Some(serde_json::to_string(&state_guard.accounts).unwrap());
        drop(state_guard);  // explicit drop to release the lock asap
        Storage::write(&storage_data);
        TauriResponse::new(Some(account))
    };
}

#[tauri::command]
pub fn account_get_active(state: tauri::State<GameState>) -> TauriResponse<Option<Account>> {
    let state_guard = state.0.lock().unwrap();
    return match Account::find_active(&state_guard.accounts) {
        Some(account) => {
            TauriResponse::new(Some(account.clone()))
        }
        None => {
            TauriResponse::new(None)
        }
    };
}

#[tauri::command]
pub fn account_all(state: tauri::State<GameState>) -> TauriResponse<Vec<Account>> {
    let state_guard = state.0.lock().unwrap();
    TauriResponse::new(state_guard.accounts.clone())
}

#[tauri::command]
pub fn account_get_by_username(state: tauri::State<GameState>, username: &str) -> TauriResponse<Option<Account>> {
    let state_guard = state.0.lock().unwrap();
    return match Account::find(&state_guard.accounts, username) {
        Some(account) => {
            TauriResponse::new(Some(account.clone()))
        }
        None => {
            TauriResponse::new(None)
        }
    };
}
