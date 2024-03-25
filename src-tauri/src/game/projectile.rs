use serde::{Deserialize, Serialize};
use ts_rs::TS;
use uuid::Uuid;
use crate::game::bounding_box::BoundingBox;
use crate::game::point::Point;
use crate::game::size::Size;

use crate::GameState;

use super::{math::Math};

#[derive(Serialize, Debug, Deserialize, Clone, TS)]
#[ts(export)]
pub struct Projectile {
    pub id: String,
    pub friendly: bool,
    pub range: f32,
    pub angle: f32,
    pub speed: f32,
    pub target: Point,
    pub bounding_box: BoundingBox
}

impl Projectile {
    pub fn new(
        position: Point,
        target: Point,
        size: Size,
        friendly: bool,
        range: f32,
        speed: f32,
    ) -> Projectile {
        Projectile {
            id: Uuid::new_v4().to_string(),
            friendly,
            bounding_box: BoundingBox::new(size, position.clone()),
            range,
            speed,
            angle: Math::get_angle(&position, &target),
            target,
        }
    }

    pub fn update(&mut self) {
        let position = self.bounding_box.get_position();
        self.angle = Math::get_angle(&position, &self.target);
        self.bounding_box.set_position(Point::new(
            position.x + self.speed * self.angle.cos(),
            position.y + self.speed * self.angle.sin(),
        ));
    }
}

#[tauri::command]
pub fn projectile_get(state: tauri::State<GameState>, id: &str) -> Option<Projectile> {
    let state_guard = state.0.lock().unwrap();
    for i in 0..state_guard.projectiles.len() {
        if state_guard.projectiles[i].id == id {
            return Some(state_guard.projectiles[i].clone());
        }
    }
    None
}

#[tauri::command]
pub fn projectile_get_all(state: tauri::State<GameState>) -> Vec<Projectile> {
    let state_guard = state.0.lock().unwrap();
    state_guard.projectiles.clone()
}
