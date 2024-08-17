use crate::game::data::characters::{Character, CharacterBaseStats, CharacterBoundingBox};

pub const CHARACTER_DEMO: Character = Character {
    id: "demo",
    title: "Demo",
    bb: CharacterBoundingBox {
        x: 0.3,
        y: 0.3,
        z: 0.3,
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
        move_speed: 0.1, // 0.03,
        armor: 1.0,
        range: 40.0,
        damage: 4.0,
    },
};