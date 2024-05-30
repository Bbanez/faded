use crate::game::data::character::{Character, CharacterBaseStats, CharacterBoundingBox};

pub const CHARACTER_DEMO: Character = Character {
    id: "demo",
    title: "Demo",
    bb: CharacterBoundingBox {
        x: 1.0,
        y: 1.0,
        z: 1.0,
    },
    base_stats: CharacterBaseStats {
        str: 4.0,
        str_to_hp: 0.05,
        str_to_dmg: 0.01,
        agi: 9.0,
        agi_to_move_speed: 0.1,
        agi_to_dmg: 0.2,
        int: 3.0,
        int_to_mana: 0.05,
        int_to_dmg: 0.01,
        hp: 15.0,
        mana: 10.0,
        stamina: 5.0,
        move_speed: 0.03, // 0.03,
        armor: 1.0,
        range: 40.0,
        damage: 4.0,
    },
};