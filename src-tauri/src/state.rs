use crate::{
    bcms::entry::{
        fdd_character::FddCharacterEntryMetaItem, fdd_enemy::FddEnemyEntryMetaItem,
        fdd_map::FddMapEntryMetaItem,
    },
    game::{nogo::Nogo, player::Player, projectile::Projectile},
    models::account::Account,
    storage::Storage,
};

#[derive(Debug)]
pub struct State {
    pub player: Player,
    pub characters: Vec<FddCharacterEntryMetaItem>,
    pub maps: Vec<FddMapEntryMetaItem>,
    pub enemies_data: Vec<FddEnemyEntryMetaItem>,
    pub projectiles: Vec<Projectile>,
    pub nogo: Nogo,
    pub active_account: Option<Account>,
    pub accounts: Vec<Account>,
    pub storage: Storage,
}

impl State {
    pub fn find_map(&mut self, map_slug: &str) -> Option<FddMapEntryMetaItem> {
        for i in 0..self.maps.len() {
            if self.maps[i].slug == map_slug {
                return Some(self.maps[i].clone());
            }
        }
        None
    }

    pub fn find_enemy_data(&mut self, enemy_data_slug: &str) -> Option<FddEnemyEntryMetaItem> {
        for i in 0..self.enemies_data.len() {
            if self.enemies_data[i].slug == enemy_data_slug {
                return Some(self.enemies_data[i].clone());
            }
        }
        None
    }

    pub fn find_character(&mut self, character_slug: &str) -> Option<FddCharacterEntryMetaItem> {
        for i in 0..self.characters.len() {
            if self.characters[i].slug == character_slug {
                return Some(self.characters[i].clone());
            }
        }
        None
    }

    pub fn find_map_and_character(
        &mut self,
        map_slug: &str,
        character_slug: &str,
    ) -> (
        Option<FddMapEntryMetaItem>,
        Option<FddCharacterEntryMetaItem>,
    ) {
        (self.find_map(map_slug), self.find_character(character_slug))
    }

    // pub fn find_enemy(&mut self, enemy_id: &str) -> Option<&Enemy> {
    //     self.enemies.iter().find(|item| item.id == enemy_id)
    // }

    pub fn find_projectile(&mut self, projectile_id: String) -> Option<(Projectile, usize)> {
        for i in 0..self.projectiles.len() {
            if self.projectiles[i].id == projectile_id {
                Some((self.projectiles[i].clone(), i));
            }
        }
        None
    }
}
