use serde::{Deserialize, Serialize};

use crate::{bcms::entry::fdd_character::FddCharacterEntryMetaItem, GameState};

use super::{
    math::Math,
    object::{BaseStats, CharacterStats, GameObject},
    path_finding,
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
        bb_size: (f32, f32),
        map_size: (f32, f32),
        base_stats: BaseStats,
    ) -> Player {
        Player {
            base_stats: base_stats.clone(),
            stats: CharacterStats::new_from_base_stats(base_stats),
            angle: 0.0,
            motion: (0.0, 0.0),
            obj: GameObject::new(position, bb_size),
            map_size,
            wanted_positions: vec![],
            wanted_position: None,
        }
    }

    pub fn new_from_bcms(
        position: (f32, f32),
        map_size: (f32, f32),
        character: &FddCharacterEntryMetaItem,
    ) -> Player {
        let base_stats = BaseStats::new_form_bcms(&character.base_stats);
        Player {
            base_stats: base_stats.clone(),
            stats: CharacterStats::new_from_base_stats(base_stats),
            angle: 0.0,
            motion: (0.0, 0.0),
            obj: GameObject::new(position, (character.bb.x as f32, character.bb.z as f32)),
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
                        if self.wanted_positions.len() > 0 {
                            self.wanted_position = Some(self.wanted_positions[0]);
                            self.angle =
                                Math::get_angle(self.obj.get_position(), self.wanted_positions[0]);
                            self.wanted_positions.remove(0);
                        } else {
                            self.wanted_position = None;
                        }
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
pub fn player_load(state: tauri::State<GameState>, character_slug: &str, map_slug: &str) -> Player {
    let mut state_guard = state.0.lock().unwrap();
    let map = state_guard.find_map(map_slug).unwrap();
    let character = state_guard.find_character(character_slug).unwrap();
    let player = Player::new_from_bcms(
        (map.start_x as f32, map.start_z as f32),
        (map.width as f32, map.height as f32),
        &character,
    );
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
    let path_opt = path_finding::a_star(
        state_guard.player.obj.clone().get_position(),
        wanted_position,
        &state_guard.nogo,
    );
    match path_opt.0 {
        Some(p) => {
            let mut path = p.clone();
            if path_opt.1 == true {
                path.push(wanted_position);
            }
            state_guard.player.wanted_positions = path;
            state_guard.player.wanted_position = None;
        }
        None => {
            println!("Path not found")
        }
    }
}
