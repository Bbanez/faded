use std::time::{SystemTime, UNIX_EPOCH};

use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Model {
    pub id: String,
    pub created_at: u128,
    pub updated_at: u128,
}

impl Model {
    pub fn new(id_opt: Option<String>) -> Model {
        let time = Model::get_current_time();
        let id = id_opt.unwrap_or_else(|| Model::generate_id());
        Model { id, created_at: time, updated_at: time }
    }

    fn get_current_time() -> u128 {
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_millis()
    }

    fn generate_id() -> String {
        Uuid::new_v4().to_string()
    }
}


