use crate::{
    models::account::Account,
};
use crate::game::manager::Manager;
use crate::models::settings::Settings;

#[derive(Debug)]
pub struct State {
    pub manager: Option<Manager>,
    pub accounts: Vec<Account>,
    pub settings: Option<Settings>,
}
