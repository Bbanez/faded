use super::consts::{PI, PI12, PI32};

pub struct Math {}

impl Math {
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
}
