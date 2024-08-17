use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::{
    db::storage::{DBStorageSerializeDeserialize, DB_STOREAGE_SPLIT_CHAR},
    util::{self, math::USize},
};

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export)]
pub struct Settings {
    pub id: String,
    pub created_at: u128,
    pub updated_at: u128,
    pub resolution: USize,
}

impl Settings {
    pub fn new(resolution: USize) -> Settings {
        let time = util::time::get_current_millis();
        let id = util::id::generate();
        Settings {
            id,
            created_at: time,
            updated_at: time,
            resolution,
        }
    }
}

impl DBStorageSerializeDeserialize for Settings {
    fn serialize(&self) -> String {
        format!(
            "{}{}\
            {}{}\
            {}{}\
            {},{}",
            self.id,
            DB_STOREAGE_SPLIT_CHAR,
            self.created_at,
            DB_STOREAGE_SPLIT_CHAR,
            self.updated_at,
            DB_STOREAGE_SPLIT_CHAR,
            self.resolution.width,
            self.resolution.height,
        )
    }

    fn deserialize(&mut self, serialized: &String) {
        let parts: Vec<&str> = serialized.split(DB_STOREAGE_SPLIT_CHAR).collect();
        self.id = parts[0].to_string();
        self.created_at = parts[1].parse().unwrap();
        self.updated_at = parts[2].parse().unwrap();
        let res_parts: Vec<&str> = parts[3].split(",").collect();
        self.resolution = USize::new(res_parts[0].parse().unwrap(), res_parts[1].parse().unwrap());
    }
}
