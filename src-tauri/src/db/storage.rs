use std::{
    fs::{self, File},
    io::{Read, Write},
    path::Path,
};

use tauri::api::path::home_dir;

pub const DB_STOREAGE_SPLIT_CHAR: &str = "__\n";

pub trait DBStorageSerializeDeserialize {
    fn serialize(&self) -> String;
    fn deserialize(&mut self, serialized: &String);
}

pub struct DBStorage {}

impl DBStorage {
    fn setup(collection: &String) -> String {
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
        let db_path_str = format!("{}/faded/db", home_base);
        let db_path = Path::new(&db_path_str);
        if db_path.exists() == false {
            match fs::create_dir(&db_path_str) {
                Ok(_f) => {
                    println!("DB directory created")
                }
                Err(err) => {
                    panic!("{}", err)
                }
            }
        }
        let col_path_str = format!("{}/faded/db/{}", home_base, collection);
        let col_path = Path::new(&col_path_str);
        if col_path.exists() == false {
            match fs::create_dir(&col_path_str) {
                Ok(_f) => {
                    println!("Collection directory created")
                }
                Err(err) => {
                    panic!("{}", err)
                }
            }
        }
        col_path_str
    }

    pub fn get_file(write: bool, collection: &String, doc: &String) -> File {
        let col_path_str = DBStorage::setup(collection);
        let file_path = format!("{}/{}.txt", col_path_str, doc);
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

    pub fn delete(collection: &String, doc: &String) {
        let col_path_str = DBStorage::setup(collection);
        let file_path_str = format!("{}/{}.txt", col_path_str, doc);
        let file_path = Path::new(&file_path_str);
        if file_path.exists() == false {
            return;
        }
        match fs::remove_file(file_path) {
            Ok(_) => {}
            Err(err) => panic!("{}", err),
        }
    }

    pub fn write<Item: DBStorageSerializeDeserialize>(
        item: Item,
        collection: &String,
        doc: &String,
    ) {
        let mut file = DBStorage::get_file(true, collection, doc);
        // let s = toml::to_string(&item).unwrap();
        let s = item.serialize();
        match file.write_all(s.as_bytes()) {
            Ok(r) => r,
            Err(e) => panic!("Failed to write file {}", e),
        }
    }

    pub fn read<Item: DBStorageSerializeDeserialize>(
        item: &mut Item,
        collection: &String,
        doc: &String,
    ) {
        let mut file = DBStorage::get_file(false, collection, doc);
        let mut content = String::new();
        return match file.read_to_string(&mut content) {
            Ok(_) => {
                item.deserialize(&content);
            }
            Err(e) => {
                panic!("Failed to read file: {:?}", e);
            }
        };
    }

    pub fn read_all<Item: DBStorageSerializeDeserialize + Clone>(
        e_item: Item,
        collection: &String,
    ) -> Vec<Item> {
        let docs = DBStorage::get_all_docs(collection);
        let mut items: Vec<Item> = vec![];
        for doc in docs {
            let mut item = e_item.clone();
            DBStorage::read(&mut item, collection, &doc);
            items.push(item.clone());
            // let mut file = DBStorage::get_file(false, collection, &doc);
            // let mut content = String::new();
            // match file.read_to_string(&mut content) {
            //     Ok(_) => {
            //         // let item = e_item::new;
            //         // let item: Item = DBStorage::parse_data(&content);
            //         // items.push(item);
            //     }
            //     Err(e) => {
            //         panic!("Failed to read file: {:?}", e);
            //     }
            // };
        }
        items
    }

    pub fn get_all_docs(collection: &String) -> Vec<String> {
        let col_path_str = DBStorage::setup(collection);
        let col_path = Path::new(&col_path_str);
        let dir = fs::read_dir(col_path).unwrap();
        let mut docs: Vec<String> = vec![];
        for entry in dir {
            let file_name = entry.unwrap().file_name();
            let file_name_str = file_name.to_str().unwrap();
            let name_parts: Vec<&str> = file_name_str.split(".").collect();
            if name_parts[0] != "" {
                docs.push(name_parts[0].to_string());
            }
        }
        docs
    }
}
