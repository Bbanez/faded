use serde::{Deserialize, Serialize};

use crate::{bcms::group::fdd_base_stats::FddBaseStatsGroup, GameState};

use super::{
    math::Math,
    object::{BaseStats, CharacterStats, GameObject},
};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum PlayerAttackType {
    RANGE,
    MELEE,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Player {
    pub base_stats: BaseStats,
    pub stats: CharacterStats,
    pub angle: f32,
    motion: (f32, f32),
    pub obj: GameObject,
    map_size: (f32, f32),
    wanted_positions: Vec<(f32, f32)>,
    wanted_position: Option<(f32, f32)>,
}

impl Player {
    pub fn new(
        position: (f32, f32),
        size: (f32, f32),
        map_size: (f32, f32),
        base_stats: BaseStats,
    ) -> Player {
        Player {
            base_stats: base_stats.clone(),
            stats: CharacterStats::new_from_base_stats(base_stats),
            angle: 0.0,
            motion: (0.0, 0.0),
            obj: GameObject::new(position, size),
            map_size,
            wanted_positions: vec![],
            wanted_position: None,
        }
    }

    pub fn new_from_bcms(
        position: (f32, f32),
        size: (f32, f32),
        map_size: (f32, f32),
        base_stats_bcms: &FddBaseStatsGroup,
    ) -> Player {
        let base_stats = BaseStats::new_form_bcms(base_stats_bcms);
        Player {
            base_stats: base_stats.clone(),
            stats: CharacterStats::new_from_base_stats(base_stats),
            angle: 0.0,
            motion: (0.0, 0.0),
            obj: GameObject::new(position, size),
            map_size,
            wanted_positions: vec![],
            wanted_position: None,
        }
    }

    pub fn set_motion(&mut self, motion: (f32, f32)) {
        self.wanted_positions = vec![];
        self.wanted_position = None;
        self.motion = motion;
    }

    pub fn on_tick(&mut self) {
        self.calc_position();
    }

    fn calc_position(&mut self) {
        if self.motion.0 != 0.0 || self.motion.1 != 0.0 {
            if self.motion.0 != 0.0 {
                self.angle += 0.02 * self.motion.0;
            }
            if self.motion.1 != 0.0 {
                let old_position = self.obj.get_position();
                self.obj.set_position((
                    old_position.0 + self.base_stats.move_speed * self.motion.1 * self.angle.cos(),
                    old_position.1 + self.base_stats.move_speed * self.motion.1 * self.angle.sin(),
                ));
            }
        } else {
            match self.wanted_position {
                Some(wanted_position) => {
                    let old_position = self.obj.get_position();
                    self.obj.set_position((
                        old_position.0 + self.base_stats.move_speed * self.angle.cos(),
                        old_position.1 + self.base_stats.move_speed * self.angle.sin(),
                    ));
                    if Math::are_points_near(
                        self.obj.get_position(),
                        wanted_position,
                        (self.stats.move_speed, self.stats.move_speed),
                    ) {
                        self.wanted_position = None;
                    }
                }
                None => {
                    if self.wanted_positions.len() > 0 {
                        self.wanted_position = Some(self.wanted_positions[0]);
                        self.angle =
                            Math::get_angle(self.obj.get_position(), self.wanted_positions[0]);
                        self.wanted_positions.remove(0);
                    }
                }
            }
        }
    }
}

#[tauri::command]
pub fn player_load(state: tauri::State<GameState>, character_slug: &str) -> Player {
    let mut state_guard = state.0.lock().unwrap();
    let mut player = state_guard.player.clone();
    {
        let char = state_guard.find_character(character_slug).unwrap();
        player.base_stats = BaseStats::new_form_bcms(&char.base_stats);
        player.stats = CharacterStats::new_from_base_stats(player.clone().base_stats);
    }
    player.obj.set_position((30.0, 85.0));
    state_guard.player = player.clone();
    player
}

#[tauri::command]
pub fn player_motion(state: tauri::State<GameState>, m: (f32, f32)) {
    let mut state_guard = state.0.lock().unwrap();
    state_guard.player.set_motion(m);
}

#[tauri::command]
pub fn player_get(state: tauri::State<GameState>) -> Player {
    state.0.lock().unwrap().player.clone()
}

#[tauri::command]
pub fn player_set_wanted_position(state: tauri::State<GameState>, wanted_position: (f32, f32)) {
    let mut state_guard = state.0.lock().unwrap();
    state_guard.player.wanted_positions = state_guard
        .nogo
        .a_star(state_guard.player.obj.clone().get_position(), wanted_position);
    state_guard.player.wanted_position = None;
}
