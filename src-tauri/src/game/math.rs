use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::game::point::Point;
use crate::game::size::Size;

use super::consts::{PI, PI12, PI32};

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export)]
pub struct MathFnLinear2D {
    points: Vec<Point>,
    k: Vec<f32>,
    n: Vec<f32>,
}

impl MathFnLinear2D {
    pub fn new(points: Vec<Point>) -> MathFnLinear2D {
        let mut k: Vec<f32> = vec![];
        let mut n: Vec<f32> = vec![];
        for i in 1..points.len() {
            k.push((points[i].y - points[i - 1].y) / (points[i].x - points[i - 1].x));
            n.push(points[i - 1].y - k[i - 1] * points[i - 1].x);
        }
        MathFnLinear2D { k, n, points }
    }

    pub fn calc(&self, x: f32) -> f32 {
        let mut best_section_idx = 0;
        let len = self.points.len() - 1;
        if x >= self.points[len].x {
            best_section_idx = len - 1;
        } else {
            for i in 0..len {
                if x >= self.points[i].x && x <= self.points[i + 1].y {
                    best_section_idx = i;
                    break;
                }
            }
        }
        self.k[best_section_idx] * x + self.n[best_section_idx]
    }

    pub fn inverse(&self, y: f32) -> f32 {
        let mut best_section_idx = 0;
        let len = self.points.len() - 1;
        if y >= self.points[len].y {
            best_section_idx = len - 1;
        } else {
            for i in 0..len {
                if y >= self.points[i].y && y < self.points[i + 1].y {
                    best_section_idx = i;
                    break;
                }
            }
        }
        (y - self.n[best_section_idx]) / self.k[best_section_idx]
    }
}


pub struct Math {}

impl Math {
    pub fn distance_between_points(start: &Point, end: &Point) -> f32 {
        let x = (end.x - start.x).abs();
        let y = (end.y - start.y).abs();
        (x * x + y * y).sqrt()
    }

    pub fn are_points_near(point1: &Point, point2: &Point, delta: &Size) -> bool {
        point1.x > point2.x - delta.width
            && point1.x < point2.x + delta.width
            && point1.y > point2.y - delta.height
            && point1.y < point2.y + delta.height
    }

    pub fn get_angle(position: &Point, target: &Point) -> f32 {
        let dx = target.x - position.x;
        let dz = target.y - position.y;
        let mut angle: f32 = 0.0;
        if dx == 0.0 {
            angle = PI12;
            if dz < 0.0 {
                angle = PI32;
            }
        } else if dz == 0.0 {
            if dx < 0.0 {
                angle = PI;
            }
        } else {
            angle = (dz / dx).atan();
            if dx < 0.0 && dz > 0.0 {
                angle = PI + angle;
            } else if dx < 0.0 && dz < 0.0 {
                angle = PI + angle;
            } else if dx > 0.0 && dz < 0.0 {
                angle = 2.0 * PI + angle
            }
        }
        angle
    }

    pub fn rad_to_deg(rad: f32) -> f32 {
        180.0 * rad / PI
    }

    pub fn deg_to_rad(deg: f32) -> f32 {
        PI * deg / 180.0
    }

    pub fn fn_linear_2d(points: Vec<Point>) -> MathFnLinear2D {
        MathFnLinear2D::new(points)
    }
}
