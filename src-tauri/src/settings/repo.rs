use crate::{
    db::storage::DBStorage,
    util::{self, math::USize},
};

use super::models::main::Settings;

#[derive(Debug)]
pub struct SettingsRepo {
    pub collection: String,
    pub item: Settings,
}

impl SettingsRepo {
    pub fn update(&mut self, resolution: USize) {
        self.item.updated_at = util::time::get_current_millis();
        self.item.resolution = resolution;
        DBStorage::write(self.item.clone(), &self.collection, &"main".to_string());
    }
}

pub fn create_settings_repo() -> SettingsRepo {
    let items: Vec<Settings> =
        DBStorage::read_all(Settings::new(USize::new(0, 0)), &"settings".to_string());
    if items.len() > 0 {
        return SettingsRepo {
            collection: "settings".to_string(),
            item: items[0].clone(),
        };
    } else {
        return SettingsRepo {
            collection: "settings".to_string(),
            item: Settings::new(USize::new(0, 0)),
        };
    }
}
