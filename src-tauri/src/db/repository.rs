use std::io::Error;

use super::{
    entity::DBEntity,
    storage::{DBStorage, DBStorageSerializeDeserialize},
};

#[derive(Debug)]
pub struct DBRepo<Item: DBEntity + Clone + DBStorageSerializeDeserialize> {
    pub collection: String,
    pub items: Vec<Item>,
}

impl<Item: DBEntity + Clone + DBStorageSerializeDeserialize> DBRepo<Item> {
    pub fn get_collection(&self) -> String {
        return self.collection.clone();
    }

    pub fn get_items(&self) -> Vec<Item> {
        return self.items.clone();
    }

    pub fn find_by_id(&self, id: String) -> Option<Item> {
        for item in &self.items {
            if item.get_id() == id {
                return Some(item.clone());
            }
        }
        return None;
    }

    pub fn add(&mut self, input_item: Item) -> Result<Item, Error> {
        let mut item = input_item.clone();
        if self.items.iter().any(|i| i.get_id() == input_item.get_id()) {
            return Err(Error::new(
                std::io::ErrorKind::Other,
                "Entity with ID already exist",
            ));
        }
        item.set_updated_at();
        self.items.push(item.clone());
        DBStorage::write(item.clone(), &self.collection, &item.get_id());
        return Ok(item);
    }

    pub fn update(&mut self, input_item: Item) -> Result<Item, Error> {
        for i in 0..self.items.len() {
            if self.items[i].get_id() == input_item.get_id() {
                let mut item = input_item.clone();
                item.set_updated_at();
                self.items[i] = item.clone();
                DBStorage::write(item.clone(), &self.collection, &item.get_id());
                return Ok(item);
            }
        }
        return Err(Error::new(
            std::io::ErrorKind::Other,
            "Entity with ID does not exist",
        ));
    }

    pub fn delete_by_id(&mut self, id: String) {
        for i in 0..self.items.len() {
            if self.items[i].get_id() == id {
                self.items.remove(i);
                DBStorage::delete(&self.collection, &id);
                break;
            }
        }
    }
}

pub fn create_db_repo<Item: DBEntity + DBStorageSerializeDeserialize + Clone>(
    base_item: Item,
    collection: &String,
) -> DBRepo<Item> {
    let items: Vec<Item> = DBStorage::read_all(base_item, &collection);
    let repo: DBRepo<Item> = DBRepo {
        collection: collection.clone(),
        items,
    };
    repo
}
