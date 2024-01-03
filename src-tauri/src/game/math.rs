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
        let a = target.0 - position.0;
        let b = target.1 - position.1;
        let mut angle = 0.0;
        if b == 0.0 {
            if a > 0.0 {
                angle = 0.0;
            } else if a < 0.0 {
                angle = PI;
            }
        } else if a == 0.0 {
            if b > 0.0 {
                angle = PI12;
            } else if b < 0.0 {
                angle = PI32;
            }
        } else {
            angle = (b / a).tan();
            if a < 0.0 && b > 0.0 {
                angle = PI - angle;
            } else if a < 0.0 && b < 0.0 {
                angle = PI + angle;
            } else if a > 0.0 && b < 0.0 {
                angle = 2.0 * PI - angle;
            }
        }
        angle
    }
}
