use std::{
    fs::{create_dir, File, OpenOptions},
    io::{Read, Write},
    path::Path,
};

use serde::{Deserialize, Serialize};
use tauri::api::path::home_dir;

use crate::GameState;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct StorageData {
    pub active_account: Option<String>,
    pub accounts: Option<String>,
}

#[derive(Debug)]
pub struct Storage {}

impl Storage {
    fn get_file(&self) -> File {
        let home = home_dir().unwrap();
        let home_base = home.display();
        let home_path = format!("{}/faded", home_base);
        let path = Path::new(&home_path);
        if path.exists() == false {
            create_dir(path).unwrap();
        }
        let file_path = format!("{}/faded/storage.toml", home_dir().unwrap().display());
        let file = OpenOptions::new()
            .read(true)
            .write(true)
            .create(true)
            .open(file_path);
        let file = match file {
            Ok(f) => f,
            Err(e) => panic!("Problem with file {:?}", e),
        };
        file
    }

    pub fn read(&self) -> StorageData {
        let mut file = self.get_file();
        let mut content = String::new();
        match file.read_to_string(&mut content) {
            Ok(_) => {
                let storage: StorageData = toml::from_str(&content).unwrap();
                storage
            }
            Err(e) => {
                println!("Failed to read file: {:?}", e);
                let storage: StorageData = toml::from_str("").unwrap();
                storage
            }
        }
    }

    fn write(&self, storage: StorageData) {
        let mut file = self.get_file();
        let s = toml::to_string(&storage).unwrap();
        match file.write_all(s.as_bytes()) {
            Ok(r) => r,
            Err(e) => panic!("Failed to write file {}", e),
        }
    }

    pub fn get(&self, key: &str) -> Option<String> {
        let storage = self.read();
        if key == "accounts" {
            return storage.accounts;
        }
        None
    }

    pub fn set(&self, key: &str, value: &str) {
        let mut storage = self.read();
        if key == "accounts" {
            storage.accounts = Some(String::from(value));
            self.write(storage);
        }
    }
}

#[tauri::command]
pub fn storage_get(state: tauri::State<GameState>, key: &str) -> Option<String> {
    let state_guard = state.0.lock().unwrap();
    state_guard.storage.get(key)
}

#[tauri::command]
pub fn storage_set(state: tauri::State<GameState>, key: &str, value: &str) {
    let state_guard = state.0.lock().unwrap();
    state_guard.storage.set(key, value);
}
