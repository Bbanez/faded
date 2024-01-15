use serde::Deserialize;

use crate::storage::Storage;

pub trait DB {
    fn items<T: for<'a> Deserialize<'a>>(key: &str) -> Vec<T> {
        let items_opt = Storage::get(key);
        match items_opt {
            Some(items) => {
                return serde_json::from_str(items.as_str()).unwrap();
            }
            None => {
                return vec![];
            }
        }
    }
}
