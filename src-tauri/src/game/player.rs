use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::{bcms::entry::fdd_character::FddCharacterEntryMetaItem, GameState};
use crate::bcms::group::fdd_base_stats::FddBaseStatsGroup;
use crate::game::bounding_box::BoundingBox;
use crate::game::math::MathFnLinear2D;
use crate::game::point::Point;
use crate::game::size::Size;

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
    pub fn new_from_bcms_stats(stats: &FddBaseStatsGroup) -> PlayerStats {
        PlayerStats {
            str: stats.str as f32,
            agi: stats.agi as f32,
            int: stats.int as f32,
            max_hp: stats.hp as f32,
            hp: stats.hp as f32,
            max_mana: stats.mana as f32,
            mana: stats.mana as f32,
            max_stamina: stats.stamina as f32,
            stamina: stats.stamina as f32,
            move_speed: stats.move_speed as f32,
            attack_speed: 1.0,
            armor: stats.armor as f32,
            range: stats.range as f32,
            damage: PlayerDamage {
                min: (stats.damage - stats.damage / 2.0) as f32,
                max: stats.damage as f32,
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
    pub character: FddCharacterEntryMetaItem,
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
        character: FddCharacterEntryMetaItem,
        position: Point,
        size: Size,
    ) -> Player {
        Player {
            stats: PlayerStats::new_from_bcms_stats(&character.base_stats),
            angle: 0.0,
            motion: Point::new(0.0, 0.0),
            bounding_box: BoundingBox::new(size, position),
            wanted_positions: vec![],
            wanted_position: None,
            character,
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
pub fn player_load(state: tauri::State<GameState>, character_slug: &str, map_slug: &str) -> Player {
    let mut state_guard = state.0.lock().unwrap();
    let map = state_guard.find_map(map_slug).unwrap();
    let character = state_guard.find_character(character_slug).unwrap();
    let player = Player::new(
        character,
        Point::new(map.start_x as f32, map.start_z as f32),
        Size::new(map.width as f32, map.height as f32),
    );
    state_guard.player = Some(player.clone());
    player
}

#[tauri::command]
pub fn player_motion(state: tauri::State<GameState>, motion: Point) {
    let mut state_guard = state.0.lock().unwrap();
    if let Some(mut player) = state_guard.player.clone() {
        player.set_motion(motion);
        state_guard.player = Some(player);
    }
}

#[tauri::command]
pub fn player_get(state: tauri::State<GameState>) -> Option<Player> {
    state.0.lock().unwrap().player.clone()
}

#[tauri::command]
pub fn player_set_wanted_position(state: tauri::State<GameState>, wanted_position: Point) {
    let mut state_guard = state.0.lock().unwrap();
    if let Some(mut player) = state_guard.player.clone() {
        let path_opt = path_finding::a_star(
            &player.bounding_box.get_position(),
            &wanted_position,
            &state_guard.map_info,
        );
        match path_opt.0 {
            Some(p) => {
                let mut path = p.clone();
                if path_opt.1 == true {
                    path.push(wanted_position);
                }
                player.wanted_positions = path.clone();
                player.wanted_position = None;
                state_guard.player = Some(player);
            }
            None => {
                println!("Path not found")
            }
        }
    } else {
        panic!("Player not initialized")
    }
}
