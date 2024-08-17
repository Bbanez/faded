// use crate::{
//     models::account::Account,
// };
// use crate::game::manager::Manager;
// use crate::map_maker::landscape::Landscape;
// use crate::models::settings::Settings;

// #[derive(Debug)]
// pub struct State {
//     pub manager: Option<Manager>,
//     pub accounts: Vec<Account>,
//     pub settings: Option<Settings>,
//     pub landscapes: Vec<Landscape>,
// }

use std::sync::Mutex;

use crate::{
    account::models::main::Account, db::repository::DBRepo, game_map::models::main::GameMap,
    settings::repo::SettingsRepo,
};

#[derive(Debug)]
pub struct State {
    pub account_repo: DBRepo<Account>,
    pub settings_repo: SettingsRepo,
    pub game_map_repo: DBRepo<GameMap>,
}

pub struct AppState(pub Mutex<State>);
