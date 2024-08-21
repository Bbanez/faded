use crate::{hero::models::main::Hero, util::math::Point3};

pub fn get() -> Hero {
    Hero {
        id: "demo".to_string(),
        name: "Demo".to_string(),
        desc: "Demo hero".to_string(),
        agi: 17.0,
        dmg: (10.0, 14.0),
        int: 9.0,
        str: 7.0,
        hp: 100.0,
        max_hp: 100.0,
        bb: Point3 {
            x: 0.3,
            y: 0.3,
            z: 0.3,
        },
    }
}
