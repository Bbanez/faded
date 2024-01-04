use serde::{Deserialize, Serialize};

use crate::GameState;

use super::{
    math::MathFnLinear2D,
    path_finding::{path_finding, PathFindingNode},
};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Nogo {
    pub nodes: Vec<PathFindingNode>,
    pub width: u32,
    pub height: u32,
    pub map_width: u32,
    pub map_height: u32,
    map_x_trans: MathFnLinear2D,
    map_z_trans: MathFnLinear2D,
}

impl Nogo {
    pub fn new(
        pixels: Vec<u8>,
        width: usize,
        height: usize,
        map_width: usize,
        map_height: usize,
    ) -> Nogo {
        let mut nodes: Vec<PathFindingNode> = vec![];
        let mut i = 0;
        let mut x = 0;
        let mut z = 0;
        while i < pixels.len() {
            let mut node = PathFindingNode {
                position: (x, z),
                valid: false,
                neighbor_idx: (
                    1000000, 1000000, 1000000, 1000000, 1000000, 1000000, 1000000, 1000000,
                ),
                f: 0,
                g: 0,
                h: 0,
                parent_idx: None,
            };
            if pixels[i] == 255 {
                node.valid = true;
            }
            if x > 0 && z > 0 {
                node.neighbor_idx.0 = ((x - 1) + ((x - 1) * (z - 1))) as usize;
            }
            if z > 0 {
                node.neighbor_idx.1 = ((x - 0) + ((x - 0) * (z - 1))) as usize;
            }
            if x < width && z > 0 {
                node.neighbor_idx.2 = ((x + 1) + ((x + 1) * (z - 1))) as usize;
            }
            if x < width {
                node.neighbor_idx.3 = ((x + 1) + ((x + 1) * (z - 0))) as usize;
            }
            if x < width && z < height {
                node.neighbor_idx.4 = ((x + 1) + ((x + 1) * (z + 1))) as usize;
            }
            if z < height {
                node.neighbor_idx.5 = ((x - 0) + ((x - 0) * (z + 1))) as usize;
            }
            if x > 0 && z < height {
                node.neighbor_idx.6 = ((x - 1) + ((x - 1) * (z + 1))) as usize;
            }
            if x > 0 {
                node.neighbor_idx.7 = ((x - 1) + ((x - 1) * (z - 0))) as usize;
            }
            nodes.push(node);
            i += 4;
            x += 1;
            if x > width {
                x = 0;
                z += 1;
            }
        }
        Nogo {
            nodes,
            width: width as u32,
            height: height as u32,
            map_width: map_width as u32,
            map_height: map_height as u32,
            map_x_trans: MathFnLinear2D::new(vec![(0.0, 0.0), (map_width as f32, width as f32)]),
            map_z_trans: MathFnLinear2D::new(vec![(0.0, 0.0), (map_height as f32, height as f32)]),
        }
    }

    pub fn get_valid_node(&self, map_position: (f32, f32)) -> Option<&PathFindingNode> {
        let x = self.map_x_trans.calc(map_position.0) as usize;
        let z = self.map_z_trans.calc(map_position.1) as usize;
        let chunk_idx = x + x * z;
        if chunk_idx < self.nodes.len() {
            return Some(&self.nodes[chunk_idx]);
        }
        None
    }

    pub fn a_star(
        &self,
        map_curr_position: (f32, f32),
        map_target_position: (f32, f32),
    ) -> Vec<(f32, f32)> {
        let mut output = vec![];
        let nodes = path_finding(map_curr_position, map_target_position, self);
        output.push(map_target_position);
        output
    }
}

#[tauri::command]
pub fn nogo_set(state: tauri::State<GameState>, pixels: Vec<u8>, map_slug: &str) -> Nogo {
    let mut state_guard = state.0.lock().unwrap();
    let map_data_opt = state_guard.find_map(map_slug);
    match map_data_opt {
        Some(map_data) => {
            state_guard.nogo = Nogo::new(
                pixels,
                map_data.nogo.width as usize,
                map_data.nogo.height as usize,
                map_data.width as usize,
                map_data.height as usize,
            );
            return state_guard.nogo.clone();
        }
        None => {
            panic!("Nogo: Map '{}' does not exist.", map_slug);
        }
    }
}
