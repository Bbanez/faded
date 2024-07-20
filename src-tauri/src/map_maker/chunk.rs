// ---- Landscape chunk u32 bit ordering
//
// Bits | Name
// -----------------
// 2    | rotation
// 1    | x-mirror
// 1    | z-mirror
// 7    | x-position
// 7    | z-position
// 4    | y-position
// 4    | set ID
// 6    | mesh ID
//
//   63           53           43           33           23           13           3   2   1
//   0000000000   0000000000   0000000000   0000000000   0000000000   0000000000   0   0   00
//  |----------| |----------| |----------| |----------| |----------| |----------| |-| |-| |--|
//  |            |            |            |            |            |            |   |   ┕ rotation
//  |            |            |            |            |            |            |   ┕ x-mirror
//  |            |            |            |            |            |            ┕ z-mirror
//  |            |            |            |            |            ┕ x-position
//  |            |            |            |            ┕ z-position
//  |            |            |            ┕ y-position
//  |            |            ┕ set ID
//  |            ┕ mesh ID
//  ┕ NOT USED
//
//   31       25     21     17        10        3   2   1
//   000000   0000   0000   0000000   0000000   0   0   00
//  |------| |----| |----| |-------| |-------| |-| |-| |--|
//  |        |      |      |         |         |   |   ┕ rotation
//  |        |      |      |         |         |   ┕ x-mirror
//  |        |      |      |         |         ┕ z-mirror
//  |        |      |      |         ┕ x-position
//  |        |      |      ┕ z-position
//  |        |      ┕ y-position
//  |        ┕ set ID
//  ┕ mesh ID

pub struct LandscapeChunk {
    pub id: u32,
    pub mesh_id: u32,
    pub set_id: u32,
    pub y: u32,
    pub z: u32,
    pub x: u32,
    pub mirror: (u32, u32),
    pub rotation: u32,
}

impl LandscapeChunk {
    pub fn new(chunk: u32, map_width: u32, map_depth: u32) -> LandscapeChunk {
        LandscapeChunk {
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

    pub fn pack(self) -> u32 {
        create(self.mesh_id, self.set_id, self.x, self.z, self.y, self.mirror, self.rotation)
    }
}

pub fn create(mesh_id: u32, set_id: u32, x_pos: u32, z_pos: u32, y_pos: u32, mirror: (u32, u32), rotation: u32) -> u32 {
    let mut chunk: u32 = 0;
    chunk = set_mesh_id(chunk, mesh_id);
    chunk = set_set_id(chunk, set_id);
    chunk = set_x_pos(chunk, x_pos);
    chunk = set_z_pos(chunk, z_pos);
    chunk = set_y_pos(chunk, y_pos);
    chunk = set_x_mirror(chunk, mirror.0);
    chunk = set_z_mirror(chunk, mirror.1);
    chunk = set_rotation(chunk, rotation);
    chunk
}

pub fn get_id(chunk: u32, map_width: u32, map_depth: u32) -> u32 {
    let x = get_x_pos(chunk);
    let y = get_y_pos(chunk);
    let z = get_z_pos(chunk);
    x + z * map_width + y * map_width * map_depth
}

pub fn set_mesh_id(chunk: u32, mesh_id: u32) -> u32 {
    (chunk & 0x3FFFFFF) | ((mesh_id & 0x3F) << 26)
}
pub fn get_mesh_id(chunk: u32) -> u32 {
    (chunk & 0xFC000000) >> 26
}

pub fn set_set_id(chunk: u32, set_id: u32) -> u32 {
    (chunk & 0xFC3FFFFF) | ((set_id & 0xF) << 22)
}
pub fn get_set_id(chunk: u32) -> u32 {
    (chunk & 0x3C00000) >> 22
}

pub fn set_y_pos(chunk: u32, y_pos: u32) -> u32 {
    (chunk & 0xFFC3FFFF) | ((y_pos & 0xF) << 18)
}
pub fn get_y_pos(chunk: u32) -> u32 {
    (chunk & 0x3C0000) >> 18
}

pub fn set_z_pos(chunk: u32, z_pos: u32) -> u32 {
    (chunk & 0xFFFC07FF) | ((z_pos & 0x7F) << 11)
}
pub fn get_z_pos(chunk: u32) -> u32 {
    (chunk & 0x3F800) >> 11
}

pub fn set_x_pos(chunk: u32, x_pos: u32) -> u32 {
    (chunk & 0xFFFFF80F) | ((x_pos & 0x7F) << 4)
}
pub fn get_x_pos(chunk: u32) -> u32 {
    (chunk & 0x7F0) >> 4
}

pub fn set_z_mirror(chunk: u32, z_mirror: u32) -> u32 {
    (chunk & 0xFFFFFFF7) | ((z_mirror & 0x1) << 3)
}
pub fn get_z_mirror(chunk: u32) -> u32 {
    (chunk & 0x8) >> 3
}

pub fn set_x_mirror(chunk: u32, x_mirror: u32) -> u32 {
    (chunk & 0xFFFFFFFB) | ((x_mirror & 0x1) << 2)
}
pub fn get_x_mirror(chunk: u32) -> u32 {
    (chunk & 0x4) >> 2
}

pub fn set_rotation(chunk: u32, rotation: u32) -> u32 {
    (chunk & 0xFFFFFFFC) | (rotation & 0b11)
}
pub fn get_rotation(chunk: u32) -> u32 {
    chunk & 0x3
}
