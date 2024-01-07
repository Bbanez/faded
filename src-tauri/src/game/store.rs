use crate::bcms::entry::{
    fdd_character::FddCharacterEntryMetaItem, fdd_enemy::FddEnemyEntryMetaItem,
    fdd_map::FddMapEntryMetaItem,
};

use super::{nogo::Nogo, player::Player, projectile::Projectile};

#[derive(Debug)]
pub struct Store {
    pub player: Player,
    pub characters: Vec<FddCharacterEntryMetaItem>,
    pub maps: Vec<FddMapEntryMetaItem>,
    pub enemies_data: Vec<FddEnemyEntryMetaItem>,
    pub projectiles: Vec<Projectile>,
    pub nogo: Nogo,
}

impl Store {
    pub fn find_map(&mut self, map_slug: &str) -> Option<&FddMapEntryMetaItem> {
        self.maps.iter().find(|item| item.slug == map_slug).clone()
    }

    pub fn find_enemy_data(&mut self, enemy_data_slug: &str) -> Option<&FddEnemyEntryMetaItem> {
        self.enemies_data
            .iter()
            .find(|item| item.slug == enemy_data_slug).clone()
    }

    pub fn find_character(&mut self, character_slug: &str) -> Option<&FddCharacterEntryMetaItem> {
        self.characters
            .iter()
            .find(|item| item.slug == character_slug).clone()
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