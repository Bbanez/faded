use serde::{Deserialize, Serialize};
use ts_rs::TS;

use super::{
    collision::{collision_with_bb, collision_with_point},
    math::Point,
    math::Size,
};

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export)]
pub struct BoundingBoxEdges {
    pub top: f32,
    pub right: f32,
    pub bottom: f32,
    pub left: f32,
}

impl BoundingBoxEdges {
    pub fn new(top: f32, right: f32, bottom: f32, left: f32) -> BoundingBoxEdges {
        BoundingBoxEdges {
            top,
            right,
            bottom,
            left,
        }
    }

    pub fn flatten(&mut self) -> (f32, f32, f32, f32) {
        (self.top, self.right, self.bottom, self.left)
    }
}

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export)]
pub struct BoundingBox {
    position: Point,
    size: Size,
    edges: BoundingBoxEdges,
}

impl BoundingBox {
    pub fn new(size: Size, position: Point) -> BoundingBox {
        let mut bb = BoundingBox {
            size,
            position,
            edges: BoundingBoxEdges::new(0.0, 0.0, 0.0, 0.0),
        };
        bb.update();
        bb
    }

    fn update(&mut self) {
        self.edges.top = self.position.y - self.size.height / 2.0;
        self.edges.right = self.position.x + self.size.width / 2.0;
        self.edges.bottom = self.position.y + self.size.height / 2.0;
        self.edges.left = self.position.x - self.size.width / 2.0;
    }

    pub fn set_size(&mut self, size: Size) {
        self.size = size;
        self.update();
    }

    pub fn get_size(&self) -> Size {
        self.size.clone()
    }

    pub fn set_position(&mut self, position: Point) {
        self.position = position;
        self.update();
    }

    pub fn get_position(&self) -> Point {
        self.position.clone()
    }

    pub fn point_inside(&self, point: (f32, f32)) -> bool {
        collision_with_point(
            (
                self.edges.top,
                self.edges.right,
                self.edges.bottom,
                self.edges.left,
            ),
            point,
        )
    }

    pub fn does_intersects(&self, bb: (f32, f32, f32, f32)) -> bool {
        collision_with_bb(
            (
                self.edges.top,
                self.edges.right,
                self.edges.bottom,
                self.edges.left,
            ),
            bb,
        )
    }

    pub fn does_intersects_bb(&self, bb: BoundingBox) -> bool {
        self.point_inside((bb.edges.left, bb.edges.top))
            || self.point_inside((bb.edges.right, bb.edges.top))
            || self.point_inside((bb.edges.right, bb.edges.bottom))
            || self.point_inside((bb.edges.left, bb.edges.bottom))
    }

    pub fn serialize(bb: &BoundingBox) -> String {
        format!(
            "{},{},\
            {},{},\
            {},{},{},{}",
            /*[0]*/ bb.position.x,
            /*[1]*/ bb.position.y,
            /*[2]*/ bb.size.width,
            /*[3]*/ bb.size.height,
            /*[4]*/ bb.edges.top,
            /*[5]*/ bb.edges.right,
            /*[6]*/ bb.edges.bottom,
            /*[7]*/ bb.edges.left,
        )
    }

    pub fn deserialize(serialized: &str) -> BoundingBox {
        let parts: Vec<&str> = serialized.split(",").collect();
        BoundingBox {
            position: Point {
                x: parts[0].parse().unwrap(),
                y: parts[1].parse().unwrap(),
            },
            size: Size {
                width: parts[2].parse().unwrap(),
                height: parts[3].parse().unwrap(),
            },
            edges: BoundingBoxEdges {
                top: parts[4].parse().unwrap(),
                right: parts[5].parse().unwrap(),
                bottom: parts[6].parse().unwrap(),
                left: parts[7].parse().unwrap(),
            },
        }
    }
}
