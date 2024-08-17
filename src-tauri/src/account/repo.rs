use crate::db::repository::{create_db_repo, DBRepo};

use super::models::main::Account;

pub fn create_account_repo() -> DBRepo<Account> {
    create_db_repo(Account::new("".to_string(), false), &"accounts".to_string())
}
