use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export)]
pub struct Size {
    pub width: f32,
    pub height: f32,
}

impl Size {
    pub fn new(width: f32, height: f32) -> Size {
        Size {
            width,
            height,
        }
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

    pub fn flatten(self) -> (f32, f32, f32, ) {
        (self.width, self.height, self.depth)
    }

    pub fn from_vec(size: (f32, f32, f32)) -> Size3 {
        Size3 {
            width: size.0,
            height: size.1,
            depth: size.2,
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
        USize {
            width,
            height,
        }
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
}
