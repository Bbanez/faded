use crate::bcms::entry::{
    fdd_character::FddCharacterEntryMetaItem, fdd_enemy::FddEnemyEntryMetaItem,
    fdd_map::FddMapEntryMetaItem,
};

use super::{player::Player, projectile::Projectile};

#[derive(Debug)]
pub struct Store {
    pub player: Player,
    pub characters: Vec<FddCharacterEntryMetaItem>,
    pub maps: Vec<FddMapEntryMetaItem>,
    pub enemies_data: Vec<FddEnemyEntryMetaItem>,
    pub projectiles: Vec<Projectile>,
}

impl Store {
    pub fn find_map(&mut self, map_id: &str) -> &FddMapEntryMetaItem {
        self.maps.iter().find(|item| item.slug == map_id).unwrap()
    }

    pub fn find_enemy_data(&mut self, enemy_data_id: &str) -> &FddEnemyEntryMetaItem {
        self.enemies_data
            .iter()
            .find(|item| item.slug == enemy_data_id)
            .unwrap()
    }

    pub fn find_character(&mut self, character_id: &str) -> Option<&FddCharacterEntryMetaItem> {
        self.characters
            .iter()
            .find(|item| item.slug == character_id)
    }

    // pub fn find_enemy(&mut self, enemy_id: &str) -> Option<&Enemy> {
    //     self.enemies.iter().find(|item| item.id == enemy_id)
    // }

    pub fn find_projectile(&mut self, projectile_id: String) -> Option<&Projectile> {
        for projectile in self.projectiles.iter() {
            if projectile.id == projectile_id {
                Some(projectile);
            }
        }
        None
    }
}
