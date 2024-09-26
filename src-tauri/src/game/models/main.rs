use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::{
    db::{
        entity::DBEntity,
        storage::{DBStorageSerializeDeserialize, DB_STOREAGE_SPLIT_CHAR},
    },
    util,
};
use crate::util::b64;
use super::player::GamePlayer;

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export)]
pub struct Game {
    pub id: String,
    pub created_at: u128,
    pub updated_at: u128,
    pub map_id: String,
    pub players: Vec<GamePlayer>
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
        let mut players_str = format!("{}", b64::encode(&GamePlayer::serialize(&self.players[0])));
        for player_idx in 1..self.players.len() {
            players_str = format!("{}{}{}", players_str, ",", b64::encode(&GamePlayer::serialize(&self.players[player_idx])))
        }
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
            /*[4]*/ players_str
        )
    }

    fn deserialize(&mut self, serialized: &String) {
        let parts: Vec<&str> = serialized.split(DB_STOREAGE_SPLIT_CHAR).collect();
        self.id = parts[0].to_string();
        self.created_at = parts[1].parse().unwrap();
        self.updated_at = parts[2].parse().unwrap();
        self.map_id = parts[3].to_string();
        self.players = vec![];
        let players_str: Vec<&str> = parts[4].split(",").collect();
        for i in 0..players_str.len() {
            let player_str_decoded = b64::decode(&players_str[i]);
            let player_str_parts: Vec<&str> = player_str_decoded.split(DB_STOREAGE_SPLIT_CHAR).collect();
            self.players.push(GamePlayer::deserialize(&player_str_parts));
        }
    }
}

impl Game {
    pub fn new_empty() -> Game {
        Game {
            id: util::id::generate(),
            created_at: util::time::get_current_millis(),
            updated_at: util::time::get_current_millis(),
            map_id: "".to_string(),
            players: vec![GamePlayer::new_empty()],
        }
    }

    pub fn new(map_id: String, players: Vec<GamePlayer>) -> Game {
        Game {
            id: util::id::generate(),
            created_at: util::time::get_current_millis(),
            updated_at: util::time::get_current_millis(),
            map_id,
            players
        }
    }

    pub fn on_tick(&mut self) {
        for i in 0..self.players.len() {
           self.players[i].on_tick();
        }
    }
}
