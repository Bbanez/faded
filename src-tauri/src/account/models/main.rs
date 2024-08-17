use std::fmt::{self, Display};

use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::{
    db::{
        entity::DBEntity,
        storage::{DBStorageSerializeDeserialize, DB_STOREAGE_SPLIT_CHAR},
    },
    util,
};

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export)]
pub struct Account {
    pub id: String,
    pub created_at: u128,
    pub updated_at: u128,
    pub username: String,
    pub active: bool,
}

impl Display for Account {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{}", self)
    }
}

impl DBStorageSerializeDeserialize for Account {
    fn serialize(&self) -> String {
        format!(
            "{}{}\
            {}{}\
            {}{}\
            {}{}\
            {}{}",
            self.id,
            DB_STOREAGE_SPLIT_CHAR,
            self.created_at,
            DB_STOREAGE_SPLIT_CHAR,
            self.updated_at,
            DB_STOREAGE_SPLIT_CHAR,
            self.username,
            DB_STOREAGE_SPLIT_CHAR,
            self.active,
            DB_STOREAGE_SPLIT_CHAR,
        )
    }

    fn deserialize(&mut self, serialized: &String) {
        let parts: Vec<&str> = serialized.split(DB_STOREAGE_SPLIT_CHAR).collect();
        self.id = parts[0].to_string();
        self.created_at = parts[1].parse().unwrap();
        self.updated_at = parts[2].parse().unwrap();
        self.username = parts[3].to_string();
        self.active = parts[4].parse().unwrap();
    }
}

impl DBEntity for Account {
    fn get_id(&self) -> String {
        let id = self.id.clone();
        return id;
    }

    fn set_updated_at(&mut self) {
        self.updated_at = util::time::get_current_millis();
    }
}

impl Account {
    pub fn new(username: String, active: bool) -> Account {
        let time = util::time::get_current_millis();
        let id = util::id::generate();
        Account {
            id,
            created_at: time,
            updated_at: time,
            username,
            active,
        }
    }
}
