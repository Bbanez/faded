use super::models::main::Hero;

pub mod demo;

pub fn get_heros() -> Vec<Hero> {
    vec![demo::get()]
}
