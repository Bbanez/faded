use serde::{Deserialize, Serialize};

use super::model::Model;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Account {
    pub model: Model,
    pub username: String,
}

impl Account {
    pub fn new(username: String) -> Account {
        Account {
            model: Model::new(None),
            username,
        }
    }
}
