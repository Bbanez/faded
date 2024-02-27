use std::{fs, fs::File, io::{Read, Write}, path::Path};

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
    fn get_file(write: bool) -> File {
        let home_base = home_dir().unwrap().display().to_string();
        let home_path = format!("{}/faded", home_base);
        let dir_path = Path::new(&home_path);
        if dir_path.exists() == false {
            match fs::create_dir(&home_path) {
                Ok(_f) => {
                    println!("Home directory created")
                }
                Err(err) => {
                    panic!("{}", err)
                }
            }
        }
        let file_path = format!("{}/faded/storage.toml", home_base);
        if write {
            match File::create(&file_path) {
                Ok(file) => {
                    return file;
                }
                Err(err) => {
                    panic!("Failed to create file: {}", err);
                }
            }
        } else {
            if Path::new(&file_path).exists() {
                match File::open(&file_path) {
                    Ok(file) => {
                        return file;
                    }
                    Err(err) => {
                        panic!("Failed to open file: {}", err)
                    }
                }
            } else {
                match File::create(&file_path) {
                    Ok(file) => {
                        return file;
                    }
                    Err(err) => {
                        panic!("Failed to create file: {}", err);
                    }
                }
            }
        }
    }

    fn parse_data(content: &str) -> StorageData {
        let data: StorageData = toml::from_str(content).unwrap();
        data
    }

    pub fn read() -> StorageData {
        let mut file = Storage::get_file(false);
        let mut content = String::new();
        return match file.read_to_string(&mut content) {
            Ok(_) => Storage::parse_data(&content),
            Err(e) => {
                println!("Failed to read file: {:?}", e);
                StorageData::new(None, None, None)
            }
        };
    }

    pub fn write(storage: &StorageData) {
        let mut file = Storage::get_file(true);
        let s = toml::to_string(storage).unwrap();
        match file.write_all(s.as_bytes()) {
            Ok(r) => r,
            Err(e) => panic!("Failed to write file {}", e),
        }
    }

    pub fn get(key: &str) -> Option<String> {
        let storage = Storage::read();
        return match key {
            "accounts" => storage.accounts,
            "active_account" => storage.active_account,
            "settings" => storage.settings,
            _ => None,
        };
    }

    pub fn set(key: &str, value: &str) {
        let mut storage = Storage::read();
        let value = String::from(value);
        if key == "accounts" {
            storage.accounts = Some(value);
            Storage::write(&storage);
        } else if key == "active_account" {
            storage.active_account = Some(value);
            Storage::write(&storage);
        } else if key == "settings" {
            storage.settings = Some(value);
            Storage::write(&storage);
        }
    }
}
