use serde::{Deserialize, Serialize};

use super::consts::{PI, PI12, PI32};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct MathFnLinear2D {
    points: Vec<(f32, f32)>,
    k: Vec<f32>,
    n: Vec<f32>,
}

impl MathFnLinear2D {
    pub fn new(points: Vec<(f32, f32)>) -> MathFnLinear2D {
        let mut k: Vec<f32> = vec![];
        let mut n: Vec<f32> = vec![];
        for i in 1..points.len() {
            k.push((points[i].1 - points[i - 1].1) / (points[i].0 - points[i - 1].0));
            n.push(points[i - 1].1 - k[i - 1] * points[i - 1].0);
        }
        MathFnLinear2D { k, n, points }
    }

    pub fn calc(&self, x: f32) -> f32 {
        let mut best_section_idx = 0;
        let len = self.points.len() - 1;
        if x >= self.points[len].0 {
            best_section_idx = len;
        } else {
            for i in 0..len {
                if x >= self.points[i].0 && x <= self.points[i + 1].0 {
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
        if y >= self.points[len].1 {
            best_section_idx = len;
        } else {
            for i in 0..len {
                if y >= self.points[i].1 && y < self.points[i + 1].1 {
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
    pub fn distance_between_points(start: (f32, f32), end: (f32, f32)) -> f32 {
        let x = (end.0 - start.0).abs();
        let y = (end.1 - start.1).abs();
        (x * x + y * y).sqrt()
    }

    pub fn are_points_near(point1: (f32, f32), point2: (f32, f32), delta: (f32, f32)) -> bool {
        point1.0 > point2.0 - delta.0
            && point1.0 < point2.0 + delta.0
            && point1.1 > point2.1 - delta.1
            && point1.1 < point2.1 + delta.1
    }

    pub fn get_angle(position: (f32, f32), target: (f32, f32)) -> f32 {
        let dx = target.0 - position.0;
        let dz = target.1 - position.1;
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

    pub fn fn_linear_2d(points: Vec<(f32, f32)>) -> MathFnLinear2D {
        MathFnLinear2D::new(points)
    }
}
