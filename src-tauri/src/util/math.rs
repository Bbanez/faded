use serde::{Deserialize, Serialize};
use ts_rs::TS;

pub const PI: f32 = 3.1415926;
pub const PI14: f32 = PI / 4.0;
pub const PI12: f32 = PI / 2.0;
pub const PI13: f32 = PI / 3.0;
pub const PI32: f32 = (3.0 * PI) / 2.0;
pub const PI34: f32 = (3.0 * PI) / 4.0;
pub const PI54: f32 = (5.0 * PI) / 4.0;
pub const PI74: f32 = (7.0 * PI) / 4.0;

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export)]
pub struct SimpleLinear2DFn {
    k: f32,
    n: f32,
}

impl SimpleLinear2DFn {
    pub fn new(p1: (f32, f32), p2: (f32, f32)) -> SimpleLinear2DFn {
        let k: f32 = (p2.1 - p1.1) / (p2.0 - p1.0);
        let n: f32 = p1.1 - k * p1.0;
        SimpleLinear2DFn { k, n }
    }

    pub fn calc(self, x: f32) -> f32 {
        x * self.k + self.n
    }

    pub fn invers(self, y: f32) -> f32 {
        (y - self.n) / self.k
    }
}

pub fn remap(x: f32, in_min: f32, in_max: f32, out_min: f32, out_max: f32) -> f32 {
    if x < in_min {
        return in_min;
    } else if x > in_max {
        return in_max;
    }
    SimpleLinear2DFn::new((in_min, out_min), (in_max, out_max)).calc(x)
}

pub fn clamp(x: f32, min: f32, max: f32) -> f32 {
    if x < min {
        return min;
    } else if x > max {
        return max;
    } else {
        return x;
    }
}

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export)]
pub struct Size {
    pub width: f32,
    pub height: f32,
}

impl Size {
    pub fn new(width: f32, height: f32) -> Size {
        Size { width, height }
    }

    pub fn flatten(self) -> (f32, f32) {
        (self.width, self.height)
    }

    pub fn from_vec(size: (f32, f32)) -> Size {
        Size {
            width: size.0,
            height: size.1,
        }
    }

    pub fn serialize(size: &Size) -> String {
        format!("{},{}", size.width, size.height)
    }

    pub fn deserialize(serialized: &str) -> Size {
        let parts: Vec<&str> = serialized.split(",").collect();
        Size {
            width: parts[0].parse().unwrap(),
            height: parts[0].parse().unwrap(),
        }
    }
}

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export)]
pub struct Size3 {
    pub width: f32,
    pub height: f32,
    pub depth: f32,
}

impl Size3 {
    pub fn new(width: f32, height: f32, depth: f32) -> Size3 {
        Size3 {
            width,
            height,
            depth,
        }
    }

    pub fn flatten(self) -> (f32, f32, f32) {
        (self.width, self.height, self.depth)
    }

    pub fn from_vec(size: (f32, f32, f32)) -> Size3 {
        Size3 {
            width: size.0,
            height: size.1,
            depth: size.2,
        }
    }

    pub fn serialize(size: &Size3) -> String {
        format!("{},{},{}", size.width, size.height, size.depth)
    }

    pub fn deserialize(serialized: &str) -> Size3 {
        let parts: Vec<&str> = serialized.split(",").collect();
        Size3 {
            width: parts[0].parse().unwrap(),
            height: parts[0].parse().unwrap(),
            depth: parts[0].parse().unwrap(),
        }
    }
}

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export)]
pub struct USize {
    pub width: usize,
    pub height: usize,
}

impl USize {
    pub fn new(width: usize, height: usize) -> USize {
        USize { width, height }
    }

    pub fn flatten(self) -> (usize, usize) {
        (self.width, self.height)
    }

    pub fn from_vec(size: (usize, usize)) -> USize {
        USize {
            width: size.0,
            height: size.1,
        }
    }

    pub fn serialize(size: &USize) -> String {
        format!("{},{}", size.width, size.height)
    }

    pub fn deserialize(serialized: &str) -> USize {
        let parts: Vec<&str> = serialized.split(",").collect();
        USize {
            width: parts[0].parse().unwrap(),
            height: parts[0].parse().unwrap(),
        }
    }
}

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export)]
pub struct USize3 {
    pub width: usize,
    pub height: usize,
    pub depth: usize,
}

impl USize3 {
    pub fn new(width: usize, height: usize, depth: usize) -> USize3 {
        USize3 {
            width,
            height,
            depth,
        }
    }

    pub fn flatten(self) -> (usize, usize, usize) {
        (self.width, self.height, self.depth)
    }

    pub fn from_vec(size: (usize, usize, usize)) -> USize3 {
        USize3 {
            width: size.0,
            height: size.1,
            depth: size.2,
        }
    }

    pub fn serialize(size: &USize3) -> String {
        format!("{},{},{}", size.width, size.height, size.depth)
    }

    pub fn deserialize(serialized: &str) -> USize3 {
        let parts: Vec<&str> = serialized.split(",").collect();
        USize3 {
            width: parts[0].parse().unwrap(),
            height: parts[0].parse().unwrap(),
            depth: parts[0].parse().unwrap(),
        }
    }
}

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export)]
pub struct Point {
    pub x: f32,
    pub y: f32,
}

impl Point {
    pub fn new(x: f32, y: f32) -> Point {
        Point { x, y }
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

    pub fn serialize(point: &Point) -> String {
        format!("{},{}", point.x, point.y)
    }

    pub fn deserialize(serialized: &str) -> Point {
        let parts: Vec<&str> = serialized.split(",").collect();
        Point {
            x: parts[0].parse().unwrap(),
            y: parts[1].replace("\n", "").parse().unwrap(),
        }
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
        Point3 { x, y, z }
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

    pub fn serialize(point: &Point3) -> String {
        format!("{},{},{}", point.x, point.y, point.z)
    }

    pub fn deserialize(serialized: &str) -> Point3 {
        let parts: Vec<&str> = serialized.split(",").collect();
        Point3 {
            x: parts[0].parse().unwrap(),
            y: parts[1].parse().unwrap(),
            z: parts[1].parse().unwrap(),
        }
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
        UPoint { x, y }
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

    pub fn serialize(point: &UPoint) -> String {
        format!("{},{}", point.x, point.y)
    }

    pub fn deserialize(serialized: &str) -> UPoint {
        let parts: Vec<&str> = serialized.split(",").collect();
        UPoint {
            x: parts[0].parse().unwrap(),
            y: parts[1].parse().unwrap(),
        }
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
        UPoint3 { x, y, z }
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

    pub fn serialize(point: &UPoint3) -> String {
        format!("{},{},{}", point.x, point.y, point.z)
    }

    pub fn deserialize(serialized: &str) -> UPoint3 {
        let parts: Vec<&str> = serialized.split(",").collect();
        UPoint3 {
            x: parts[0].parse().unwrap(),
            y: parts[1].parse().unwrap(),
            z: parts[1].parse().unwrap(),
        }
    }
}
