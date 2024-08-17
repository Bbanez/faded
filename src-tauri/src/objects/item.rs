use serde::{Deserialize, Serialize};
use ts_rs::TS;

/**
There are few type of items.

- Consumable: This item can be used once. When item
is consumed it can:
  - Heal a character
  - Fill mana
  - Temporarly increase stats
- Active magical: This item can be used infinite amount
of time and has a duration to its effect and cooldown
*/
#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export)]
pub struct Item {
    pub id: String,
    pub name: String,
    pub desc: String,
    pub icon: String,
    pub consumable: bool,
    pub stackable: bool,
    pub count: u32,
    pub single_use: bool,
    /**
    If item can be consumed/used, this property
    determan for how long will the item effect
    last.
    */
    pub effect_duration: u32,
    /**
    Cooldown in milliseconds
    */
    pub cd: u32,
    /**
    Can Be Used After millis (unix timestamp).
    If current time is smaller then cbua, spell is not usable,
    othervise, spell can be cast
    */
    pub cbua: u128,

    pub sdmg: (f32, f32),
    pub pdmg: (f32, f32),
    pub ms: f32,
    pub hp: f32,
    pub hp_reg: f32,
    pub mana: f32,
    pub mana_reg: f32,
    pub str: f32,
    pub agi: f32,
    pub int: f32,
    pub cc: f32,
    pub att_spd: f32,
    pub armor: f32,
}
