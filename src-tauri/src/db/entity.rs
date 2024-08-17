pub trait DBEntity {
    fn get_id(&self) -> String;
    fn set_updated_at(&mut self);
}
