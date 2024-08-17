use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export)]
pub struct Point {
    pub x: f32,
    pub y: f32,
}

impl Point {
    pub fn new(x: f32, y: f32) -> Point {
        Point {
            x,
            y,
        }
    }

    pub fn flatten(&mut self) -> (f32, f32) {
        (self.x, self.y)
    }

    pub fn from_vec(point: (f32, f32)) -> Point {
        Point {
            x: point.0,
            y: point.1,
        }
    }

    pub fn to_u_point(self) -> UPoint {
        UPoint::new(self.x as usize, self.y as usize)
    }
}

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export)]
pub struct Point3 {
    pub x: f32,
    pub y: f32,
    pub z: f32,
}

impl Point3 {
    pub fn new(x: f32, y: f32, z: f32) -> Point3 {
        Point3 {
            x,
            y,
            z,
        }
    }

    pub fn flatten(self) -> (f32, f32, f32) {
        (self.x, self.y, self.z)
    }

    pub fn from_vec(point: (f32, f32, f32)) -> Point3 {
        Point3 {
            x: point.0,
            y: point.1,
            z: point.2,
        }
    }

    pub fn to_u_point(self) -> UPoint3 {
        UPoint3::new(self.x as usize, self.y as usize, self.z as usize)
    }
}

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export)]
pub struct UPoint {
    pub x: usize,
    pub y: usize,
}

impl UPoint {
    pub fn new(x: usize, y: usize) -> UPoint {
        UPoint {
            x,
            y,
        }
    }

    pub fn flatten(&mut self) -> (usize, usize) {
        (self.x, self.y)
    }

    pub fn from_vec(point: (usize, usize)) -> UPoint {
        UPoint {
            x: point.0,
            y: point.1,
        }
    }

    pub fn to_point(self) -> Point {
        Point::new(self.x as f32, self.y as f32)
    }
}

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export)]
pub struct UPoint3 {
    pub x: usize,
    pub y: usize,
    pub z: usize,
}

impl UPoint3 {
    pub fn new(x: usize, y: usize, z: usize) -> UPoint3 {
        UPoint3 {
            x,
            y,
            z,
        }
    }

    pub fn flatten(self) -> (usize, usize, usize) {
        (self.x, self.y, self.z)
    }

    pub fn from_vec(point: (usize, usize, usize)) -> UPoint3 {
        UPoint3 {
            x: point.0,
            y: point.1,
            z: point.2,
        }
    }

    pub fn to_u_point(self) -> Point3 {
        Point3::new(self.x as f32, self.y as f32, self.z as f32)
    }
}
