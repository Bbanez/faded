use serde::{Deserialize, Serialize};

use super::collision::{collision_with_bb, collision_with_point};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct BoundingBox {
    position: (f32, f32),
    size: (f32, f32),
    pub top: f32,
    pub right: f32,
    pub bottom: f32,
    pub left: f32,
}

impl BoundingBox {
    pub fn new(size: (f32, f32), position: (f32, f32)) -> BoundingBox {
        let mut bb = BoundingBox {
            size,
            position,
            top: 0.0,
            right: 0.0,
            bottom: 0.0,
            left: 0.0,
        };
        bb.update();
        bb
    }

    fn update(&mut self) {
        self.top = self.position.1 - self.size.1 / 2.0;
        self.right = self.position.0 + self.size.0 / 2.0;
        self.bottom = self.position.1 + self.size.1 / 2.0;
        self.left = self.position.0 - self.size.0 / 2.0;
    }

    pub fn set_size(&mut self, width: f32, height: f32) {
        self.size.0 = width;
        self.size.1 = height;
        self.update();
    }

    pub fn get_size(&mut self) -> (f32, f32) {
        self.size
    }

    pub fn set_position(&mut self, position: (f32, f32)) {
        self.position = position;
        self.update();
    }

    pub fn get_position(&mut self) -> (f32, f32) {
        self.position
    }

    pub fn is_inside(&mut self, point: (f32, f32)) -> bool {
        collision_with_point((self.top, self.right, self.bottom, self.left), point)
    }

    pub fn does_intersects(&mut self, bb: (f32, f32, f32, f32)) -> bool {
        collision_with_bb((self.top, self.right, self.bottom, self.left), bb)
    }

    pub fn does_intersects_bb(&mut self, bb: BoundingBox) -> bool {
        self.is_inside((bb.left, bb.top))
            || self.is_inside((bb.right, bb.top))
            || self.is_inside((bb.right, bb.bottom))
            || self.is_inside((bb.left, bb.bottom))
    }
}
