use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::{db::entity::DBEntity, util};

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export)]
pub struct Game {
    pub id: String,
    pub created_at: u128,
    pub updated_at: u128,
}

impl DBEntity for Game {
    fn get_id(&self) -> String {
        self.id.clone()
    }

    fn set_updated_at(&mut self) {
        self.updated_at = util::time::get_current_millis();
    }
}
