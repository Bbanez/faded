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
use crate::util::b64;
use crate::util::math::{are_points_near, get_angle};

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export)]
pub struct GamePlayer {
    pub account_id: String,
    pub hero: Hero,
    pub bb: BoundingBox,
    pub wps: Vec<Point>,
    pub wp: Option<Point>,
    pub angle: f32,
}

impl GamePlayer {
    pub fn new(account_id: String, hero: Hero, position: Point, angle: f32) -> GamePlayer {
        let c_bb = hero.bb.clone();
        GamePlayer {
            account_id,
            hero,
            bb: BoundingBox::new(Size::new(c_bb.x, c_bb.z), position),
            wp: None,
            wps: vec![],
            angle,
        }
    }

    pub fn new_empty() -> GamePlayer {
        GamePlayer {
            account_id: "".to_string(),
            bb: BoundingBox::new(Size::new(0.0, 0.0), Point::new(0.0, 0.0)),
            hero: Hero::new_empty(),
            wp: None,
            wps: vec![],
            angle: 0.0,
        }
    }

    pub fn on_tick(&mut self) {
        self.calc_position();
        // self.hero.level_partial = self.exp_to_level.calc(self.stats.exp);
        // self.hero.level = self.stats.level_partial as usize;
        // self.hero.exp_percent = (self.stats.level_partial - self.stats.level as f32) * 100.0;
    }

    fn calc_position(&mut self) {
        if let Some(wanted_position) = self.wp.clone() {
            let old_position = self.bb.get_position();
            self.bb.set_position(Point::new(
                old_position.x + self.hero.move_speed * self.angle.cos(),
                old_position.y + self.hero.move_speed * self.angle.sin(),
            ));
            if are_points_near(
                &self.bb.get_position(),
                &wanted_position,
                &Size::new(self.hero.move_speed, self.hero.move_speed),
            ) {
                if self.wps.len() > 0 {
                    self.wp = Some(self.wps[0].clone());
                    self.angle =
                        get_angle(&self.bb.get_position(), &self.wps[0]);
                    self.wps.remove(0);
                } else {
                    self.wp = None;
                }
            }
        } else {
            if self.wps.len() > 0 {
                self.wp = Some(self.wps[0].clone());
                self.angle =
                    get_angle(&self.bb.get_position(), &self.wps[0]);
                self.wps.remove(0);
            }
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
            {}{}\
            {}",
            /*[0]*/ player.account_id,
            DB_STOREAGE_SPLIT_CHAR,
            /*[1]*/ b64::encode(&Hero::serialize(&player.hero)),
            DB_STOREAGE_SPLIT_CHAR,
            /*[2]*/ BoundingBox::serialize(&player.bb),
            DB_STOREAGE_SPLIT_CHAR,
            /*[3]*/ wps,
            DB_STOREAGE_SPLIT_CHAR,
            /*[4]*/ wp,
            DB_STOREAGE_SPLIT_CHAR,
            /*[5]*/ player.angle
        )
    }

    pub fn deserialize(parts: &[&str]) -> GamePlayer {
        let wps_parts: Vec<&str> = parts[3].split(",").collect();
        let mut wps: Vec<Point> = vec![];
        if wps_parts.len() > 1 {
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
        if parts[4] != "" {
            let wp_parts: Vec<&str> = parts[4].split(",").collect();
            wp = Some(Point {
                x: wp_parts[0].parse().unwrap(),
                y: wp_parts[1].parse().unwrap(),
            })
        }
        let hero_str = b64::decode(parts[1]);
        let hero_parts: Vec<&str> = hero_str.split(DB_STOREAGE_SPLIT_CHAR).collect();
        GamePlayer {
            account_id: parts[0].to_string(),
            hero: Hero::deserialize(&hero_parts),
            bb: BoundingBox::deserialize(parts[2]),
            wps,
            wp,
            angle: parts[5].replace("\n", "").parse().unwrap(),
        }
    }
}
