use std::time::{SystemTime, UNIX_EPOCH};

use serde::{Serialize, Deserialize};
use uuid::Uuid;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Model {
    pub id: String,
    pub created_at: u128,
    pub updated_at: u128,
}

impl Model {
    pub fn new(id_opt: Option<String>) -> Model {
        let time = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_millis();
        match id_opt {
            Some(id) => {
                return Model {
                    id,
                    created_at: time,
                    updated_at: time,
                };
            }
            None => {
                return Model {
                    id: Uuid::new_v4().to_string(),
                    created_at: time,
                    updated_at: time,
                };
            }
        }
    }
}
