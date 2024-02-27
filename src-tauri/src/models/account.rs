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

    pub fn find<'a>(accounts: &'a [Account], username: &str) -> Option<&'a Account> {
        accounts.iter().find(|account| account.username == username)
    }

    pub fn set(accounts: &mut Vec<Account>, account: Account) -> &mut Vec<Account> {
        match accounts.iter().position(|acc| acc.username == account.username) {
            Some(position) => accounts[position] = account,
            None => accounts.push(account),
        }
        accounts
    }

    pub fn get_or_create(accounts: &mut Vec<Account>, username: &str) -> Option<usize> {
        match accounts.iter().position(|account| account.username == username) {
            Some(index) => Some(index),
            None => {
                let account = Account::new(username.to_string());
                accounts.push(account);
                Some(accounts.len() - 1)
            }
        }
    }
}

#[tauri::command]
pub fn account_create(state: tauri::State<GameState>, username: &str) -> Account {
    let mut state_guard = state.0.lock().unwrap();
    let account_index = Account::get_or_create(&mut state_guard.accounts, username);
    let account = state_guard.accounts[account_index.unwrap()].clone();

    state_guard.active_account = Some(account.clone());
    let mut storage_data = Storage::read();
    storage_data.active_account = Some(serde_json::to_string(&account).unwrap());
    storage_data.accounts = Some(serde_json::to_string(&state_guard.accounts).unwrap());
    drop(state_guard);  // explicit drop to release the lock asap
    Storage::write(&storage_data);
    account
}

#[tauri::command]
pub fn account_load(state: tauri::State<GameState>, username: &str) -> Option<Account> {
    let mut state_guard = state.0.lock().unwrap();
    // let accounts = state_guard.accounts.clone();
    return match Account::find(&state_guard.accounts.clone(), username) {
        Some(account) => {
            state_guard.active_account = Some(account.clone());
            Some(account.clone())
        }
        None => {
            None
        }
    }
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
