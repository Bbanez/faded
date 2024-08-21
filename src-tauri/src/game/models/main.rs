use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::{
    db::{
        entity::DBEntity,
        storage::{DBStorageSerializeDeserialize, DB_STOREAGE_SPLIT_CHAR},
    },
    util,
};

use super::player::GamePlayer;

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export)]
pub struct Game {
    pub id: String,
    pub created_at: u128,
    pub updated_at: u128,
    pub map_id: String,
    pub p1: GamePlayer,
}

impl DBEntity for Game {
    fn get_id(&self) -> String {
        self.id.clone()
    }

    fn set_updated_at(&mut self) {
        self.updated_at = util::time::get_current_millis();
    }
}

impl DBStorageSerializeDeserialize for Game {
    fn serialize(&self) -> String {
        format!(
            "{}{}\
            {}{}\
            {}{}\
            {}{}\
            {}",
            /*[0]*/ self.id,
            DB_STOREAGE_SPLIT_CHAR,
            /*[1]*/ self.created_at,
            DB_STOREAGE_SPLIT_CHAR,
            /*[2]*/ self.updated_at,
            DB_STOREAGE_SPLIT_CHAR,
            /*[3]*/ self.map_id,
            DB_STOREAGE_SPLIT_CHAR,
            /*[4]*/ GamePlayer::serialize(&self.p1)
        )
    }

    fn deserialize(&mut self, serialized: &String) {
        let parts: Vec<&str> = serialized.split(DB_STOREAGE_SPLIT_CHAR).collect();
        self.id = parts[0].to_string();
        self.created_at = parts[1].parse().unwrap();
        self.updated_at = parts[2].parse().unwrap();
        self.map_id = parts[3].to_string();
        self.p1 = GamePlayer::deserialize(&parts[4..parts.len()]);
    }
}

impl Game {
    pub fn new_empty() -> Game {
        Game {
            id: util::id::generate(),
            created_at: util::time::get_current_millis(),
            updated_at: util::time::get_current_millis(),
            map_id: "".to_string(),
            p1: GamePlayer::new_empty(),
        }
    }

    pub fn new(map_id: String, p1: GamePlayer) -> Game {
        Game {
            id: util::id::generate(),
            created_at: util::time::get_current_millis(),
            updated_at: util::time::get_current_millis(),
            map_id,
            p1,
        }
    }
}
