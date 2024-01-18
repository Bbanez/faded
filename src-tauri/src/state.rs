use crate::{
    bcms::entry::{
        fdd_character::FddCharacterEntryMetaItem, fdd_enemy::FddEnemyEntryMetaItem,
        fdd_map::FddMapEntryMetaItem,
    },
    game::{nogo::Nogo, player::Player, projectile::Projectile},
    models::account::Account,
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
}

impl State {
    pub fn find_map(&self, map_slug: &str) -> Option<FddMapEntryMetaItem> {
        self.maps.iter()
            .find(|&map| map.slug == map_slug)
            .cloned()
    }

    pub fn find_enemy_data(&self, enemy_data_slug: &str) -> Option<FddEnemyEntryMetaItem> {
        self.enemies_data.iter()
            .find(|&enemy| enemy.slug == enemy_data_slug)
            .cloned()
    }

    pub fn find_character(&self, character_slug: &str) -> Option<FddCharacterEntryMetaItem> {
        self.characters.iter()
            .find(|character| character.slug == character_slug)
            .cloned()
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

    pub fn find_projectile(&self, projectile_id: &str) -> Option<(Projectile, usize)> {
        self.projectiles
            .iter()
            .enumerate()
            .find(|(_, projectile)| projectile.id == projectile_id)
            .map(|(i, projectile)| (projectile.clone(), i))
    }
}
