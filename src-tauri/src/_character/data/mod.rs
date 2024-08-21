use demo::character_demo;

use super::models::main::Character;

pub mod demo;

pub fn get_characters() -> Vec<Character> {
    return vec![character_demo()];
}
