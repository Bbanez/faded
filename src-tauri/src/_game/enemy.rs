use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::game::bounding_box::BoundingBox;
use crate::game::data::enemies::{EnemyData, EnemyDataBaseStats};
use crate::game::manager::Manager;
use crate::game::math::Math;
use crate::game::path_finding;
use crate::game::point::Point;
use crate::game::size::Size;
use crate::response::TauriResponse;
use crate::util;
use crate::util::id;

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export)]
pub struct EnemyDamage {
    pub min: f32,
    pub max: f32,
}

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export)]
pub struct EnemyStats {
    pub str: f32,
    pub agi: f32,
    pub int: f32,
    pub max_hp: f32,
    pub hp: f32,
    pub max_mana: f32,
    pub mana: f32,
    pub max_stamina: f32,
    pub stamina: f32,
    pub move_speed: f32,
    pub attack_speed: f32,
    pub armor: f32,
    pub range: f32,
    pub damage: EnemyDamage,
    pub exp: f32,
    pub exp_percent: f32,
    pub level_partial: f32,
    pub level: usize,
}

impl EnemyStats {
    pub fn new_from_enemy_base_stats(stats: &EnemyDataBaseStats) -> EnemyStats {
        EnemyStats {
            str: stats.str,
            agi: stats.agi,
            int: stats.int,
            max_hp: stats.hp,
            hp: stats.hp,
            max_mana: stats.mana,
            mana: stats.mana,
            max_stamina: stats.stamina,
            stamina: stats.stamina,
            move_speed: stats.move_speed,
            attack_speed: 1.0,
            armor: stats.armor,
            range: stats.range,
            damage: EnemyDamage {
                min: stats.damage - stats.damage / 2.0,
                max: stats.damage,
            },
            exp: 0.0,
            exp_percent: 0.0,
            level: 1,
            level_partial: 1.0,
        }
    }
}

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export)]
pub struct Enemy {
    pub id: String,
    pub data_id: String,
    pub stats: EnemyStats,
    pub angle: f32,
    pub bounding_box: BoundingBox,
    motion: Point,
    wanted_positions: Vec<Point>,
    wanted_position: Option<Point>,
    move_to: Option<Point>,
}

impl Enemy {
    pub fn new(enemy_data: EnemyData, position: Point) -> Enemy {
        Enemy {
            id: id::generate(),
            data_id: enemy_data.id.to_string(),
            angle: 0.0,
            motion: Point::new(0.0, 0.0),
            bounding_box: BoundingBox::new(Size::new(enemy_data.bb.x, enemy_data.bb.z), position),
            wanted_positions: vec![],
            wanted_position: None,
            stats: EnemyStats::new_from_enemy_base_stats(&enemy_data.base_stats),
            move_to: None,
        }
    }

    pub fn on_tick(&mut self, manager: &mut Manager) -> Option<TauriResponse<String>> {
        let mut should_path_find = false;
        let mut move_to = Point::new(0.0, 0.0);
        if let Some(existing_move_to) = self.move_to.clone() {
            if Math::are_points_near(
                &existing_move_to,
                &manager.player.bounding_box.get_position(),
                &Size::new(1.0, 1.0))
            {
                move_to = manager.player.bounding_box.get_position();
                should_path_find = true;
            }
        } else {
            move_to = manager.player.clone().bounding_box.get_position();
            self.move_to = Some(move_to.clone());
            should_path_find = true;
        }
        if should_path_find == true {
            let path_opt = path_finding::a_star(
                &manager.player.bounding_box.get_position(),
                &move_to,
                &manager.nav_mesh,
            );
            match path_opt.0 {
                Some(p) => {
                    let mut path = p.clone();
                    if path_opt.1 == true {
                        path.push(move_to);
                    }
                    self.wanted_positions = path.clone();
                    self.wanted_position = None;
                    manager.updated_at = util::time::get_current_millis();
                }
                None => {
                    return Some(TauriResponse::new_error(
                        400,
                        "Path not found",
                    ));
                }
            };
        }
        self.calc_position();
        None
    }

    fn calc_position(&mut self) {
        if self.motion.x != 0.0 || self.motion.y != 0.0 {
            if self.motion.x != 0.0 {
                self.angle += 0.02 * self.motion.y;
            }
            if self.motion.y != 0.0 {
                let old_position = self.bounding_box.get_position();
                self.bounding_box.set_position(Point::new(
                    old_position.x + self.stats.move_speed * self.motion.y * self.angle.cos(),
                    old_position.y + self.stats.move_speed * self.motion.y * self.angle.sin(),
                ));
            }
        } else {
            if let Some(wanted_position) = self.wanted_position.clone() {
                let old_position = self.bounding_box.get_position();
                self.bounding_box.set_position(Point::new(
                    old_position.x + self.stats.move_speed * self.angle.cos(),
                    old_position.y + self.stats.move_speed * self.angle.sin(),
                ));
                if Math::are_points_near(
                    &self.bounding_box.get_position(),
                    &wanted_position,
                    &Size::new(self.stats.move_speed, self.stats.move_speed),
                ) {
                    if self.wanted_positions.len() > 0 {
                        self.wanted_position = Some(self.wanted_positions[0].clone());
                        self.angle =
                            Math::get_angle(&self.bounding_box.get_position(), &self.wanted_positions[0]);
                        self.wanted_positions.remove(0);
                    } else {
                        self.wanted_position = None;
                    }
                }
            } else {
                if self.wanted_positions.len() > 0 {
                    self.wanted_position = Some(self.wanted_positions[0].clone());
                    self.angle =
                        Math::get_angle(&self.bounding_box.get_position(), &self.wanted_positions[0]);
                    self.wanted_positions.remove(0);
                }
            }
        }
    }
}

