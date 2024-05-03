use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::game::bounding_box::BoundingBox;
use crate::game::data::character::{Character, CharacterBaseStats};
use crate::game::math::MathFnLinear2D;
use crate::game::point::Point;
use crate::game::size::Size;
use crate::{GameState, util};
use crate::response::TauriResponse;

use super::{math::Math, path_finding};

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export)]
pub struct PlayerDamage {
    pub min: f32,
    pub max: f32,
}

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export)]
pub struct PlayerStats {
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
    pub damage: PlayerDamage,
    pub exp: f32,
    pub exp_percent: f32,
    pub level_partial: f32,
    pub level: usize,
}

impl PlayerStats {
    pub fn new_from_character_stats(stats: &CharacterBaseStats) -> PlayerStats {
        PlayerStats {
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
            damage: PlayerDamage {
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
pub struct Player {
    pub account_id: String,
    pub character_id: String,
    pub stats: PlayerStats,
    pub angle: f32,
    motion: Point,
    pub bounding_box: BoundingBox,
    wanted_positions: Vec<Point>,
    wanted_position: Option<Point>,
    exp_to_level: MathFnLinear2D,
}

impl Player {
    pub fn new(
        account_id: String,
        character: Character,
        position: Point,
        size: Size,
    ) -> Player {
        Player {
            account_id,
            stats: PlayerStats::new_from_character_stats(&character.base_stats),
            angle: 0.0,
            motion: Point::new(0.0, 0.0),
            bounding_box: BoundingBox::new(size, position),
            wanted_positions: vec![],
            wanted_position: None,
            character_id: character.id.to_string(),
            exp_to_level: MathFnLinear2D::new(vec![
                Point::new(0.0, 1.0),
                Point::new(20.0, 2.0),
                Point::new(40.0, 3.0),
                Point::new(60.0, 4.0),
                Point::new(80.0, 5.0),
                Point::new(110.0, 6.0),
                Point::new(145.0, 7.0),
                Point::new(200.0, 8.0),
                Point::new(300.0, 9.0),
                Point::new(450.0, 10.0),
            ]),
        }
    }

    pub fn set_motion(&mut self, motion: Point) {
        self.wanted_positions = vec![];
        self.wanted_position = None;
        self.motion = motion;
    }

    pub fn on_tick(&mut self) {
        self.calc_position();
        self.stats.level_partial = self.exp_to_level.calc(self.stats.exp);
        self.stats.level = self.stats.level_partial as usize;
        self.stats.exp_percent = (self.stats.level_partial - self.stats.level as f32) * 100.0;
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

#[tauri::command]
pub fn player_motion(state: tauri::State<GameState>, motion: Point) -> TauriResponse<Player> {
    let mut state_guard = state.0.lock().unwrap();
    return if let Some(mut manager) = state_guard.manager.clone() {
        manager.player.set_motion(motion);
        manager.updated_at = util::time::get_current_millis();
        TauriResponse::new(manager.player)
    } else {
        TauriResponse::new_error(
            400,
            "Game manager does not exist",
        )
    };
}

#[tauri::command]
pub fn player_get(state: tauri::State<GameState>) -> TauriResponse<Player> {
    let state_guard = state.0.lock().unwrap();
    return match state_guard.manager.clone() {
        Some(manager) => {
            TauriResponse::new(manager.player)
        }
        None => {
            TauriResponse::new_error(
                400,
                "Game manager does not exist",
            )
        }
    };
}

#[tauri::command]
pub fn player_set_wanted_position(state: tauri::State<GameState>, wanted_position: Point) -> TauriResponse<Player> {
    let mut state_guard = state.0.lock().unwrap();
    return match state_guard.manager.clone() {
        Some(mut manager) => {
            let path_opt = path_finding::a_star(
                &manager.player.bounding_box.get_position(),
                &wanted_position,
                &manager.nav_mesh,
            );
            return match path_opt.0 {
                Some(p) => {
                    let mut path = p.clone();
                    if path_opt.1 == true {
                        path.push(wanted_position);
                    }
                    manager.player.wanted_positions = path.clone();
                    manager.player.wanted_position = None;
                    manager.updated_at = util::time::get_current_millis();
                    state_guard.manager = Some(manager.clone());
                    TauriResponse::new(manager.player)
                }
                None => {
                    TauriResponse::new_error(
                        400,
                        "Path not found",
                    )
                }
            };
        }
        None => {
            TauriResponse::new_error(
                400,
                "Game manager does not exist",
            )
        }
    };
}
