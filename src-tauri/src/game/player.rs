use std::f32::consts::PI;

use serde::{Deserialize, Serialize};

use crate::{bcms::group::fdd_base_stats::FddBaseStatsGroup, GameState};

use super::{
    consts::{PI12, PI14, PI32, PI34, PI54, PI74},
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
    pointing_at: (f32, f32),
    pointing_at_angle: f32,
}

impl Player {
    pub fn new(
        position: (f32, f32),
        size: (f32, f32),
        map_size: (f32, f32),
        base_stats: BaseStats,
        pointing_at: (f32, f32),
    ) -> Player {
        Player {
            base_stats: base_stats.clone(),
            stats: CharacterStats::new_from_base_stats(base_stats),
            angle: 0.0,
            motion: (0.0, 0.0),
            obj: GameObject::new(position, size),
            map_size,
            pointing_at,
            pointing_at_angle: Math::get_angle(position, pointing_at),
        }
    }

    pub fn new_from_bcms(
        position: (f32, f32),
        size: (f32, f32),
        map_size: (f32, f32),
        base_stats_bcms: &FddBaseStatsGroup,
        pointing_at: (f32, f32),
    ) -> Player {
        let base_stats = BaseStats::new_form_bcms(base_stats_bcms);
        Player {
            base_stats: base_stats.clone(),
            stats: CharacterStats::new_from_base_stats(base_stats),
            angle: 0.0,
            motion: (0.0, 0.0),
            obj: GameObject::new(position, size),
            map_size,
            pointing_at,
            pointing_at_angle: Math::get_angle(position, pointing_at),
        }
    }

    pub fn set_motion(&mut self, motion: (f32, f32)) {
        self.motion = motion;
        // Set angle
        if self.motion.0 == 1.0 && self.motion.1 == 0.0 {
            self.angle = 0.0;
        } else if self.motion.0 == 1.0 && self.motion.1 == 1.0 {
            self.angle = PI14;
        } else if self.motion.0 == 0.0 && self.motion.1 == 1.0 {
            self.angle = PI12;
        } else if self.motion.0 == -1.0 && self.motion.1 == 1.0 {
            self.angle = PI34;
        } else if self.motion.0 == -1.0 && self.motion.1 == 0.0 {
            self.angle = PI;
        } else if self.motion.0 == -1.0 && self.motion.1 == -1.0 {
            self.angle = PI54;
        } else if self.motion.0 == 0.0 && self.motion.1 == -1.0 {
            self.angle = PI32;
        } else if self.motion.0 == 1.0 && self.motion.1 == -1.0 {
            self.angle = PI74;
        }
    }

    pub fn set_pointing_at(&mut self, pointing_at: (f32, f32)) {
        self.pointing_at = pointing_at;
        self.pointing_at_angle = Math::get_angle(self.obj.get_position(), pointing_at);
    }

    pub fn get_pointing_at(&mut self) -> (f32, f32) {
        self.pointing_at
    }

    pub fn on_tick(&mut self) {
        self.calc_position();
    }

    fn calc_position(&mut self) {
        let old_position = self.obj.get_position();
        let position = (
            self.base_stats.move_speed * self.angle.cos() * self.motion.0.abs() + old_position.0,
            self.base_stats.move_speed * self.angle.sin() * self.motion.1.abs() + old_position.1,
        );
        let mut x = position.0;
        let mut z = position.1;
        let size = self.obj.get_size();
        if position.0 <= size.0 / 2.0 {
            x = size.0 / 2.0;
        } else if position.0 >= self.map_size.0 - size.0 / 2.0 {
            x = self.map_size.0 - size.0 / 2.0;
        }
        if position.1 <= size.1 / 2.0 {
            z = size.1 / 2.0;
        } else if position.1 >= self.map_size.1 - size.1 / 2.0 {
            z = self.map_size.1 - size.1 / 2.0;
        }
        self.obj.set_position((x, z))
    }
}

// #[tauri::command]
// pub fn player_attack(state: tauri::State<GameState>) -> Option<Projectile> {
//     let mut state_guard = state.0.lock().unwrap();
//     if state_guard.player.is_attacking() {
//         let player = state_guard.player.clone();
//         let projectile = Projectile::new(
//             player.obj.clone().get_position(),
//             player.pointing_at,
//             (5.0, 5.0),
//             true,
//             300.0,
//             1.0,
//         );
//         state_guard.projectiles.push(projectile.clone());
//         state_guard.player.attack();
//         return Some(projectile);
//     }
//     None
// }

#[tauri::command]
pub fn player_load(
    state: tauri::State<GameState>,
    screen_width: f32,
    screen_height: f32,
    character_id: &str,
    pointing_at: (f32, f32),
) -> Player {
    let mut state_guard = state.0.lock().unwrap();
    let mut player = state_guard.player.clone();
    player.set_pointing_at(pointing_at);
    {
        let char = state_guard.find_character(character_id).unwrap();
        player.base_stats = BaseStats::new_form_bcms(&char.base_stats);
        player.stats = CharacterStats::new_from_base_stats(player.clone().base_stats);
    }
    player
        .obj
        .set_position((screen_width / 2.0, screen_height / 2.0));
    // .set_position((2000.0, 800.0));
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
pub fn player_pointing_at(state: tauri::State<GameState>, p: (f32, f32)) -> Player {
    let mut state_guard = state.0.lock().unwrap();
    state_guard.player.set_pointing_at(p);
    state_guard.player.clone()
}
