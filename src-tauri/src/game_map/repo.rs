use crate::db::repository::{create_db_repo, DBRepo};

use super::models::main::GameMap;

pub fn create_game_map_repo() -> DBRepo<GameMap> {
    create_db_repo(GameMap::new_empty(), &"maps".to_string())
}
