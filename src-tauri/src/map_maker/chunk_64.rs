// ---- Landscape chunk u32 bit ordering
//
// Bits | Name
// -----------------
// 2     | rotation
// 1     | x-mirror
// 1     | z-mirror
// 10    | x-position
// 10    | z-position
// 10    | y-position
// 8     | set ID
// 10    | mesh ID
//
//   0                                          1
//   |--------------------------------------|   |-----------------------------------------------|
//    31             19           9              31         23           13           3   2   1
//    000000000000   0000000000   0000000000 <-> 00000000   0000000000   0000000000   0   0   00
//   |------------| |----------| |----------|   |--------| |----------| |----------| |-| |-| |--|
//   |              |            |              |          |            |            |   |   ┕ rotation
//   |              |            |              |          |            |            |   ┕ x-mirror
//   |              |            |              |          |            |            ┕ z-mirror
//   |              |            |              |          |            ┕ x-position
//   |              |            |              |          ┕ z-position
//   |              |            |              ┕ set ID
//   |              |            ┕ y-position
//   |              ┕ mesh ID
//   ┕ NOT USED

pub struct LandscapeChunk64 {
    pub id: u32,
    pub mesh_id: u32,
    pub set_id: u32,
    pub y: u32,
    pub z: u32,
    pub x: u32,
    pub mirror: (u32, u32),
    pub rotation: u32,
}

impl LandscapeChunk64 {
    pub fn new(chunk: (u32, u32), map_width: u32, map_depth: u32) -> LandscapeChunk64 {
        LandscapeChunk64 {
            id: get_id(chunk, map_width, map_depth),
            mesh_id: get_mesh_id(chunk),
            set_id: get_set_id(chunk),
            y: get_y_pos(chunk),
            z: get_z_pos(chunk),
            x: get_x_pos(chunk),
            mirror: (get_x_mirror(chunk), get_z_mirror(chunk)),
            rotation: get_rotation(chunk),
        }
    }

    pub fn pack(self) -> (u32, u32) {
        create(
            self.mesh_id,
            self.set_id,
            self.x,
            self.z,
            self.y,
            self.mirror,
            self.rotation,
        )
    }
}

pub fn create(
    mesh_id: u32,
    set_id: u32,
    x_pos: u32,
    z_pos: u32,
    y_pos: u32,
    mirror: (u32, u32),
    rotation: u32,
) -> (u32, u32) {
    let mut chunk: (u32, u32) = (0, 0);
    set_mesh_id(&mut chunk, mesh_id);
    set_set_id(&mut chunk, set_id);
    set_x_pos(&mut chunk, x_pos);
    set_z_pos(&mut chunk, z_pos);
    set_y_pos(&mut chunk, y_pos);
    set_x_mirror(&mut chunk, mirror.0);
    set_z_mirror(&mut chunk, mirror.1);
    set_rotation(&mut chunk, rotation);
    chunk
}

pub fn get_id(chunk: (u32, u32), map_width: u32, map_depth: u32) -> u32 {
    let x = get_x_pos(chunk);
    let y = get_y_pos(chunk);
    let z = get_z_pos(chunk);
    x + z * map_width + y * map_width * map_depth
}

pub fn set_mesh_id(chunk: &mut (u32, u32), mesh_id: u32) {
    chunk.0 = (chunk.0 & 0xFFF003FF) | ((mesh_id & 0x3FF) << 10);
}
pub fn get_mesh_id(chunk: (u32, u32)) -> u32 {
    (chunk.0 & 0xFFC00) >> 10
}

pub fn set_set_id(chunk: &mut (u32, u32), set_id: u32) {
    chunk.1 = (chunk.1 & 0xFFFFFF) | ((set_id & 0xFF) << 24);
}
pub fn get_set_id(chunk: (u32, u32)) -> u32 {
    (chunk.1 & 0xFF000000) >> 24
}

pub fn set_y_pos(chunk: &mut (u32, u32), y_pos: u32) {
    chunk.0 = (chunk.0 & 0xFFFFFC00) | (y_pos & 0x3FF);
}
pub fn get_y_pos(chunk: (u32, u32)) -> u32 {
    chunk.0 & 0x3FF
}

pub fn set_z_pos(chunk: &mut (u32, u32), z_pos: u32) {
    chunk.1 = (chunk.1 & 0xFF003FFF) | ((z_pos & 0x3FF) << 14);
}
pub fn get_z_pos(chunk: (u32, u32)) -> u32 {
    (chunk.1 & 0xFFC000) >> 14
}

pub fn set_x_pos(chunk: &mut (u32, u32), x_pos: u32) {
    chunk.1 = (chunk.1 & 0xFFFFFC0F) | ((x_pos & 0x3FF) << 4);
}
pub fn get_x_pos(chunk: (u32, u32)) -> u32 {
    (chunk.1 & 0x7F0) >> 4
}

pub fn set_z_mirror(chunk: &mut (u32, u32), z_mirror: u32) {
    chunk.1 = (chunk.1 & 0xFFFFFFF7) | ((z_mirror & 0x1) << 3);
}
pub fn get_z_mirror(chunk: (u32, u32)) -> u32 {
    (chunk.1 & 0x8) >> 3
}

pub fn set_x_mirror(chunk: &mut (u32, u32), x_mirror: u32) {
    chunk.1 = (chunk.1 & 0xFFFFFFFB) | ((x_mirror & 0x1) << 2);
}
pub fn get_x_mirror(chunk: (u32, u32)) -> u32 {
    (chunk.1 & 0x4) >> 2
}

pub fn set_rotation(chunk: &mut (u32, u32), rotation: u32) {
    chunk.1 = (chunk.1 & 0xFFFFFFFC) | (rotation & 0b11);
}
pub fn get_rotation(chunk: (u32, u32)) -> u32 {
    chunk.1 & 0x3
}
