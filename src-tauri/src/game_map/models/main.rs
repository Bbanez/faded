use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::{
    db::{
        entity::DBEntity,
        storage::{DBStorageSerializeDeserialize, DB_STOREAGE_SPLIT_CHAR},
    },
    util::{
        self, b64,
        math::{Point3, UPoint, USize3},
    },
};

use super::landscape::{GameMapLandscape, GameMapLandscapeLite};

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export)]
pub struct GameMap {
    pub id: String,
    pub created_at: u128,
    pub updated_at: u128,
    pub landscape: GameMapLandscape,
    pub name: String,
    pub desc: String,
    pub image: Option<String>,
    pub hero_start_position: Point3,
}

impl DBEntity for GameMap {
    fn get_id(&self) -> String {
        self.id.clone()
    }

    fn set_updated_at(&mut self) {
        self.updated_at = util::time::get_current_millis();
    }
}

impl DBStorageSerializeDeserialize for GameMap {
    fn serialize(&self) -> String {
        let mut chunks_str = format!(
            "{},{}",
            self.landscape.chunks[0].0, self.landscape.chunks[1].1
        );
        let mut chunk_idx: usize = 1;
        while chunk_idx < self.landscape.chunks.len() {
            chunks_str = format!(
                "{},{},{}",
                chunks_str, self.landscape.chunks[chunk_idx].0, self.landscape.chunks[chunk_idx].1
            );
            chunk_idx += 1;
        }
        let mut image_str = "-".to_string();
        match self.image.clone() {
            Some(url) => image_str = url,
            None => {}
        }
        format!(
            "{}{}\
            {}{}\
            {}{}\
            {},{},{}{}\
            {}{}\
            {},{},{}{}\
            {}{}\
            {}{}\
            {}{}\
            {}{}\
            {},{}{}\
            {}{}\
            {}{}\
            {}{}\
            {}",
            /*[0]*/ self.id,
            DB_STOREAGE_SPLIT_CHAR,
            /*[1]*/ self.created_at,
            DB_STOREAGE_SPLIT_CHAR,
            /*[2]*/ self.updated_at,
            DB_STOREAGE_SPLIT_CHAR,
            /*[3]*/ self.landscape.size.width,
            /*[3]*/ self.landscape.size.height,
            /*[3]*/ self.landscape.size.depth,
            DB_STOREAGE_SPLIT_CHAR,
            /*[4]*/ chunks_str,
            DB_STOREAGE_SPLIT_CHAR,
            /*[5]*/ self.landscape.camera_position.x,
            /*[5]*/ self.landscape.camera_position.y,
            /*[5]*/ self.landscape.camera_position.z,
            DB_STOREAGE_SPLIT_CHAR,
            /*[6]*/ self.landscape.camera_rotation,
            DB_STOREAGE_SPLIT_CHAR,
            /*[7]*/ self.landscape.camera_d,
            DB_STOREAGE_SPLIT_CHAR,
            /*[8]*/ self.landscape.camera_speed,
            DB_STOREAGE_SPLIT_CHAR,
            /*[9]*/ self.landscape.selected_level,
            DB_STOREAGE_SPLIT_CHAR,
            /*[10]*/ self.landscape.start_position.x,
            /*[10]*/ self.landscape.start_position.y,
            DB_STOREAGE_SPLIT_CHAR,
            /*[11]*/ b64::encode(&self.name),
            DB_STOREAGE_SPLIT_CHAR,
            /*[12]*/ b64::encode(&self.desc),
            DB_STOREAGE_SPLIT_CHAR,
            /*[13]*/ b64::encode(&image_str),
            DB_STOREAGE_SPLIT_CHAR,
            /*[14]*/ Point3::serialize(&self.hero_start_position),
        )
    }

    fn deserialize(&mut self, serialized: &String) {
        let parts: Vec<&str> = serialized.split(DB_STOREAGE_SPLIT_CHAR).collect();
        self.id = parts[0].to_string();
        self.created_at = parts[1].parse().unwrap();
        self.updated_at = parts[2].parse().unwrap();
        let mut landscape_chunks: Vec<(u32, u32)> = vec![];
        let chunk_values: Vec<&str> = parts[4].split(",").collect();
        let mut chunk_idx: usize = 0;
        while chunk_idx < chunk_values.len() {
            landscape_chunks.push((
                chunk_values[chunk_idx].parse().unwrap(),
                chunk_values[chunk_idx + 1].parse().unwrap(),
            ));
            chunk_idx += 2;
        }
        let size_parts: Vec<&str> = parts[3].split(",").collect();
        let cam_pos_parts: Vec<&str> = parts[5].split(",").collect();
        let start_pos_parts: Vec<&str> = parts[10].split(",").collect();
        self.landscape = GameMapLandscape {
            size: USize3::new(
                size_parts[0].parse().unwrap(),
                size_parts[1].parse().unwrap(),
                size_parts[2].parse().unwrap(),
            ),
            chunks: landscape_chunks,
            camera_position: Point3::new(
                cam_pos_parts[0].parse().unwrap(),
                cam_pos_parts[1].parse().unwrap(),
                cam_pos_parts[2].parse().unwrap(),
            ),
            camera_rotation: parts[6].parse().unwrap(),
            camera_d: parts[7].parse().unwrap(),
            camera_speed: parts[8].parse().unwrap(),
            selected_level: parts[9].parse().unwrap(),
            start_position: UPoint::new(
                start_pos_parts[0].parse().unwrap(),
                start_pos_parts[1].parse().unwrap(),
            ),
        };
        self.name = b64::decode(parts[11]);
        self.desc = b64::decode(parts[12]);
        let image_str_parts: Vec<&str> = parts[13].split("\n").collect();
        let image_str = b64::decode(image_str_parts[0]);
        if image_str == "-" {
            self.image = None
        } else {
            self.image = Some(image_str);
        }
        self.hero_start_position = Point3::deserialize(parts[14]);
    }
}

impl GameMap {
    pub fn new(
        name: String,
        desc: String,
        image: Option<String>,
        landscape: GameMapLandscape,
        hero_start_position: Point3,
    ) -> GameMap {
        GameMap {
            id: util::id::generate(),
            created_at: util::time::get_current_millis(),
            updated_at: util::time::get_current_millis(),
            name,
            desc,
            image,
            landscape,
            hero_start_position,
        }
    }

    pub fn new_empty() -> GameMap {
        GameMap {
            id: util::id::generate(),
            created_at: util::time::get_current_millis(),
            updated_at: util::time::get_current_millis(),
            desc: String::new(),
            image: None,
            name: String::new(),
            landscape: GameMapLandscape::new_empty(),
            hero_start_position: Point3::new(0.0, 0.0, 0.0),
        }
    }
}

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export)]
pub struct GameMapLite {
    pub id: String,
    pub created_at: u128,
    pub updated_at: u128,
    pub landscape: GameMapLandscapeLite,
    pub name: String,
    pub desc: String,
    pub image: Option<String>,
}

impl GameMapLite {
    pub fn new_from_game_map(map: &GameMap) -> GameMapLite {
        GameMapLite {
            id: map.id.clone(),
            created_at: map.created_at,
            updated_at: map.updated_at,
            name: map.name.clone(),
            desc: map.desc.clone(),
            image: map.image.clone(),
            landscape: GameMapLandscapeLite::new_form_landscape(&map.landscape),
        }
    }
}
