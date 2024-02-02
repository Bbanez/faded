use std::{
    fs::{create_dir, File, OpenOptions},
    io::{Read, Write},
    path::Path,
};

use serde::{Deserialize, Serialize};
use tauri::api::path::home_dir;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct StorageData {
    pub active_account: Option<String>,
    pub accounts: Option<String>,
    pub settings: Option<String>,
}

impl StorageData {
    pub fn new(active_account: Option<String>, accounts: Option<String>, settings: Option<String>) -> StorageData {
        StorageData {
            accounts,
            active_account,
            settings,
        }
    }
}

#[derive(Debug)]
pub struct Storage {}

impl Storage {
    fn create_directory_if_not_exists(home_path: &str) {
        let path = Path::new(home_path);
        if !path.exists() {
            create_dir(path).unwrap();
        }
    }

    fn open_file_or_panic(file_path: &str) -> File {
        match OpenOptions::new().read(true).write(true).create(true).open(file_path) {
            Ok(f) => f,
            Err(e) => panic!("Problem with file {:?}", e),
        }
    }

    fn get_file() -> File {
        let home_base = home_dir().unwrap().display().to_string();
        let home_path = format!("{}/faded", home_base);
        Storage::create_directory_if_not_exists(&home_path);

        let file_path = format!("{}/faded/storage.toml", home_base);
        Storage::open_file_or_panic(&file_path)
    }

    fn parse_data(content: &str) -> StorageData {
        let data: StorageData = toml::from_str(content).unwrap();
        data
    }

    pub fn read() -> StorageData {
        let mut file = Storage::get_file();
        let mut content = String::new();

        return match file.read_to_string(&mut content) {
            Ok(_) => Storage::parse_data(&content),
            Err(e) => {
                println!("Failed to read file: {:?}", e);
                StorageData::new(None, None, None)
            }
        };
    }

    pub fn write(storage: StorageData) {
        let mut file = Storage::get_file();
        let s = toml::to_string(&storage).unwrap();
        match file.write_all(s.as_bytes()) {
            Ok(r) => r,
            Err(e) => panic!("Failed to write file {}", e),
        }
    }

    pub fn get(key: &str) -> Option<String> {
        let storage = Storage::read();
        match key {
            "accounts" => storage.accounts,
            "active_account" => storage.active_account,
            "settings" => storage.settings,
            _ => None,
        }
    }

    pub fn set(key: &str, value: &str) {
        let mut storage = Storage::read();
        let value = String::from(value);
        if key == "accounts" {
            storage.accounts = Some(value);
            Storage::write(storage);
        } else if key == "active_account" {
            storage.active_account = Some(value);
            Storage::write(storage);
        } else if key == "settings" {
            storage.settings = Some(value);
            Storage::write(storage);
        }
    }
}

#[tauri::command]
pub fn storage_get(key: &str) -> Option<String> {
    Storage::get(key)
}

#[tauri::command]
pub fn storage_set(key: &str, value: &str) {
    Storage::set(key, value);
}
