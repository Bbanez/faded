use std::{
    borrow::BorrowMut,
    fs::{create_dir, File, OpenOptions},
    io::{Read, Write},
    path::Path,
};

use serde::{Deserialize, Serialize};
use tauri::api::path::home_dir;

#[derive(Serialize, Deserialize)]
struct Storage {
    accounts: Option<String>,
}

fn get_storage_file() -> File {
    let home = home_dir().unwrap();
    let home_base = home.display();
    let home_path = format!("{}/last-minute", home_base);
    let path = Path::new(&home_path);
    if path.exists() == false {
        create_dir(path).unwrap();
    }
    let file_path = format!("{}/last-minute/storage.toml", home_dir().unwrap().display());
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

fn read_storage() -> Storage {
    let mut f = get_storage_file();
    let file = f.borrow_mut();
    let mut content = String::new();
    match file.read_to_string(&mut content) {
        Ok(_) => {
            let storage: Storage = toml::from_str(&content).unwrap();
            storage
        }
        Err(e) => {
            println!("Failed to read file: {:?}", e);
            let storage: Storage = toml::from_str("").unwrap();
            storage
        }
    }
}

fn write_storage(storage: Storage) -> () {
    let mut f = get_storage_file();
    let file = f.borrow_mut();
    let s = toml::to_string(&storage).unwrap();
    match file.write_all(s.as_bytes()) {
        Ok(r) => r,
        Err(e) => panic!("Failed to write file {}", e),
    }
}

#[tauri::command]
pub fn storage_get(key: &str) -> Option<String> {
    let storage = read_storage();
    if key == "accounts" {
        return storage.accounts;
    }
    None
}

#[tauri::command]
pub fn storage_set(key: &str, value: &str) {
    let mut storage = read_storage();
    println!("Write DB: key={} value={}", key, value);
    if key == "accounts" {
        storage.accounts = Some(String::from(value));
        write_storage(storage);
    }
}
