use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::{
    db::storage::DB_STOREAGE_SPLIT_CHAR,
    hero::models::main::Hero,
    util::{
        bounding_box::BoundingBox,
        math::{Point, Size},
    },
};

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export)]
pub struct GamePlayer {
    pub account_id: String,
    pub hero: Hero,
    pub bb: BoundingBox,
    pub wps: Vec<Point>,
    pub wp: Option<Point>,
}

impl GamePlayer {
    pub fn new(account_id: String, hero: Hero, position: Point) -> GamePlayer {
        let c_bb = hero.bb.clone();
        GamePlayer {
            account_id,
            hero,
            bb: BoundingBox::new(Size::new(c_bb.x, c_bb.z), position),
            wp: None,
            wps: vec![],
        }
    }

    pub fn new_empty() -> GamePlayer {
        GamePlayer {
            account_id: "".to_string(),
            bb: BoundingBox::new(Size::new(0.0, 0.0), Point::new(0.0, 0.0)),
            hero: Hero::new_empty(),
            wp: None,
            wps: vec![],
        }
    }

    pub fn serialize(player: &GamePlayer) -> String {
        let mut wps: String = "".to_string();
        if player.wps.len() > 0 {
            wps = format!("{},{}", player.wps[0].x, player.wps[0].y);
            for i in 1..player.wps.len() {
                wps = format!("{},{},{}", wps, player.wps[i].x, player.wps[i].y);
            }
        }
        let wp: String;
        match &player.wp {
            Some(w) => {
                wp = format!("{},{}", w.x, w.y);
            }
            None => {
                wp = "".to_string();
            }
        }
        format!(
            "{}{}\
            {}{}\
            {}{}\
            {}{}\
            {}",
            /*[0]*/ player.account_id,
            DB_STOREAGE_SPLIT_CHAR,
            /*[1]*/ Hero::serialize(&player.hero),
            DB_STOREAGE_SPLIT_CHAR,
            /*[11]*/ BoundingBox::serialize(&player.bb),
            DB_STOREAGE_SPLIT_CHAR,
            /*[12]*/ wps,
            DB_STOREAGE_SPLIT_CHAR,
            /*[13]*/ wp
        )
    }

    pub fn deserialize(parts: &[&str]) -> GamePlayer {
        let wps_parts: Vec<&str> = parts[10].split(",").collect();
        let mut wps: Vec<Point> = vec![];
        if wps_parts.len() > 0 {
            wps.push(Point {
                x: wps_parts[0].parse().unwrap(),
                y: wps_parts[1].parse().unwrap(),
            });
            let mut i = 2;
            while i < wps_parts.len() {
                wps.push(Point {
                    x: wps_parts[i].parse().unwrap(),
                    y: wps_parts[i + 1].parse().unwrap(),
                });
                i += 2;
            }
        }
        let mut wp: Option<Point> = None;
        if parts[11] != "" {
            let wp_parts: Vec<&str> = parts[11].split(",").collect();
            wp = Some(Point {
                x: wp_parts[0].parse().unwrap(),
                y: wp_parts[1].parse().unwrap(),
            })
        }
        GamePlayer {
            account_id: parts[0].to_string(),
            hero: Hero::deserialize(&parts[1..11]),
            bb: BoundingBox::deserialize(parts[11]),
            wps,
            wp,
        }
    }
}
