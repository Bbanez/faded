pub fn collision_with_point(
    bb: (
        // top
        f32,
        // right
        f32,
        // bottom
        f32,
        // left
        f32,
    ),
    point: (f32, f32),
) -> bool {
    point.0 > bb.1 && point.0 < bb.3 && point.1 > bb.0 && point.1 < bb.2
}

pub fn collision_with_bb(
    bb1: (
        // top
        f32,
        // right
        f32,
        // bottom
        f32,
        // left
        f32,
    ),
    bb2: (
        // top
        f32,
        // right
        f32,
        // bottom
        f32,
        // left
        f32,
    ),
) -> bool {
    collision_with_point(bb1, (bb2.3, bb2.0))
        || collision_with_point(bb1, (bb2.1, bb2.0))
        || collision_with_point(bb1, (bb2.1, bb2.2))
        || collision_with_point(bb1, (bb2.3, bb2.2))
}
