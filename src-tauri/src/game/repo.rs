use crate::db::repository::{create_db_repo, DBRepo};

use super::models::main::Game;

pub fn create_game_repo() -> DBRepo<Game> {
    create_db_repo(Game::new_empty(), &"games".to_string())
}
