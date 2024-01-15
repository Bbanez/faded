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
}

#[derive(Debug)]
pub struct Storage {}

impl Storage {
    fn get_file() -> File {
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

    pub fn read() -> StorageData {
        let mut file = Storage::get_file();
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

    fn write(storage: StorageData) {
        let mut file = Storage::get_file();
        let s = toml::to_string(&storage).unwrap();
        match file.write_all(s.as_bytes()) {
            Ok(r) => r,
            Err(e) => panic!("Failed to write file {}", e),
        }
    }

    pub fn get(key: &str) -> Option<String> {
        let storage = Storage::read();
        if key == "accounts" {
            return storage.accounts;
        }
        None
    }

    pub fn set(key: &str, value: &str) {
        let mut storage = Storage::read();
        if key == "accounts" {
            storage.accounts = Some(String::from(value));
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
