use crate::{state::AppState, util::tauri_api_response::TauriResponse};

use super::models::main::Account;

#[tauri::command]
pub fn account_create(state: tauri::State<AppState>, username: &str) -> TauriResponse<Account> {
    let mut state_guard = state.0.lock().unwrap();
    let mut existing_account_idx: usize = 1000000;
    for i in 0..state_guard.account_repo.items.len() {
        if state_guard.account_repo.items[i].active == true {
            let mut account = state_guard.account_repo.items[i].clone();
            account.active = false;
            match state_guard.account_repo.update(account) {
                Ok(_) => {}
                Err(err) => println!("{}", err),
            }
        }
        state_guard.account_repo.items[i].active = false;
        if state_guard.account_repo.items[i].username == username {
            existing_account_idx = i;
        }
    }
    if existing_account_idx != 1000000 {
        state_guard.account_repo.items[existing_account_idx].active = true;
        let account_clone = state_guard.account_repo.items[existing_account_idx].clone();
        match state_guard.account_repo.update(account_clone) {
            Ok(account) => return TauriResponse::new(account),
            Err(err) => {
                println!("{}", err);
                return TauriResponse::new_error(500, "Failed to update account");
            }
        }
    }
    let account = state_guard
        .account_repo
        .add(Account::new(username.to_string(), true));
    match account {
        Ok(account) => return TauriResponse::new(account),
        Err(err) => {
            println!("{}", err);
            return TauriResponse::new_error(500, "Failed to update account");
        }
    }
}

#[tauri::command]
pub fn account_load(state: tauri::State<AppState>, id: &str) -> TauriResponse<Option<Account>> {
    let mut state_guard = state.0.lock().unwrap();
    let mut account_index: usize = 1000000;
    for i in 0..state_guard.account_repo.items.len() {
        if state_guard.account_repo.items[i].id == id {
            account_index = i;
            let mut account = state_guard.account_repo.items[i].clone();
            account.active = true;
            match state_guard.account_repo.update(account) {
                Ok(_) => {}
                Err(err) => println!("{}", err),
            }
        } else if state_guard.account_repo.items[i].active == true {
            let mut account = state_guard.account_repo.items[i].clone();
            account.active = false;
            match state_guard.account_repo.update(account) {
                Ok(_) => {}
                Err(err) => println!("{}", err),
            }
        }
    }
    return if account_index == 1000000 {
        TauriResponse::new(None)
    } else {
        let account = state_guard.account_repo.items[account_index].clone();
        TauriResponse::new(Some(account))
    };
}

#[tauri::command]
pub fn account_get_active(state: tauri::State<AppState>) -> TauriResponse<Option<Account>> {
    let state_guard = state.0.lock().unwrap();
    for i in 0..state_guard.account_repo.items.len() {
        if state_guard.account_repo.items[i].active {
            return TauriResponse::new(Some(state_guard.account_repo.items[i].clone()));
        }
    }
    TauriResponse::new(None)
}

#[tauri::command]
pub fn account_all(state: tauri::State<AppState>) -> TauriResponse<Vec<Account>> {
    let state_guard = state.0.lock().unwrap();
    TauriResponse::new(state_guard.account_repo.items.clone())
}

#[tauri::command]
pub fn account_get_by_username(
    state: tauri::State<AppState>,
    username: &str,
) -> TauriResponse<Option<Account>> {
    let state_guard = state.0.lock().unwrap();
    for i in 0..state_guard.account_repo.items.len() {
        if state_guard.account_repo.items[i].username == username {
            return TauriResponse::new(Some(state_guard.account_repo.items[i].clone()));
        }
    }
    TauriResponse::new(None)
}
