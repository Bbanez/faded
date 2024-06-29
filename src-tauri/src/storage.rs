use std::{fs, fs::File, io::{Read, Write}, path::Path};

use serde::{Deserialize, Serialize};
use tauri::api::path::home_dir;

use crate::map_maker::landscape::Landscape;
use crate::models::account::Account;
use crate::models::settings::Settings;

const STORAGE_VERSION: usize = 1;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct StorageData {
    pub version: Option<usize>,
    pub accounts: Option<String>,
    pub settings: Option<String>,
    pub landscapes: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct StorageDataUnpacked {
    pub version: usize,
    pub accounts: Vec<Account>,
    pub settings: Option<Settings>,
    pub landscapes: Vec<Landscape>,
}

impl StorageData {
    pub fn new(version: Option<usize>, accounts: Option<String>, settings: Option<String>, landscapes: Option<String>) -> StorageData {
        StorageData {
            version,
            accounts,
            settings,
            landscapes,
        }
    }

    pub fn data_to_unpacked(data: StorageData) -> StorageDataUnpacked {
        StorageData::new_unpacked(data.version, data.accounts, data.settings, data.landscapes)
    }

    pub fn new_unpacked(version: Option<usize>, accounts: Option<String>, settings: Option<String>, landscapes: Option<String>) -> StorageDataUnpacked {
        let mut unpacked = StorageDataUnpacked {
            version: STORAGE_VERSION,
            accounts: vec![],
            landscapes: vec![],
            settings: None,
        };
        match accounts {
            Some(accounts_str) => {
                unpacked.accounts = serde_json::from_str(&accounts_str).unwrap();
            }
            None => {
                unpacked.accounts = vec![];
            }
        }
        match landscapes {
            Some(landscapes_str) => {
                unpacked.landscapes = serde_json::from_str(&landscapes_str).unwrap();
            }
            None => {
                unpacked.landscapes = vec![];
            }
        }
        match settings {
            Some(settings_str) => {
                unpacked.settings = serde_json::from_str(&settings_str).unwrap();
            }
            None => {
                unpacked.settings = None;
            }
        }
        match version {
            Some(ver) => {
                if ver < unpacked.version {
                    // TODO: Migrate storage data to new version
                }
            }
            None => {
                unpacked.version = STORAGE_VERSION;
            }
        }
        unpacked
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
                StorageData::new(None, None, None, None)
            }
        };
    }

    pub fn read_unpacked() -> StorageDataUnpacked {
        let mut file = Storage::get_file(false);
        let mut content = String::new();
        return match file.read_to_string(&mut content) {
            Ok(_) => StorageData::data_to_unpacked(Storage::parse_data(&content)),
            Err(e) => {
                println!("Failed to read file: {:?}", e);
                StorageData::new_unpacked(None, None, None, None)
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
        } else if key == "settings" {
            storage.settings = Some(value);
            Storage::write(&storage);
        }
    }
}
