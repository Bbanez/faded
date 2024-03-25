use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::GameState;

use super::{math::MathFnLinear2D, path_finding::PathFindingNode};

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export)]
pub struct Nogo {
    pub nodes: Vec<PathFindingNode>,
    pub width: u32,
    pub height: u32,
    pub map_width: u32,
    pub map_height: u32,
    pub map_node_width: f32,
    pub map_node_height: f32,
    pub map_x_trans: MathFnLinear2D,
    pub map_z_trans: MathFnLinear2D,
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
        let map_x_trans = MathFnLinear2D::new(vec![(0.0, 0.0), (map_width as f32, width as f32)]);
        let map_z_trans = MathFnLinear2D::new(vec![(0.0, 0.0), (map_height as f32, height as f32)]);
        let map_node_width = map_x_trans.inverse(1.0);
        let map_node_height = map_z_trans.inverse(1.0);
        while i < pixels.len() {
            let mut node = PathFindingNode {
                position: (x, z),
                map_position: (
                    map_x_trans.inverse(x as f32) + map_node_width / 2.0,
                    map_z_trans.inverse(z as f32) + map_node_height / 2.0,
                ),
                valid: false,
                neighbor_idx: (
                    1000000, 1000000, 1000000, 1000000, 1000000, 1000000, 1000000, 1000000,
                ),
                g: 0,
                h: 0,
                parent_idx: None,
            };
            if pixels[i] < 200 {
                node.valid = true;
            }
            if x > 0 && z > 0 {
                node.neighbor_idx.0 = ((x - 1) + (width * (z - 1))) as usize;
            }
            if z > 0 {
                node.neighbor_idx.1 = ((x - 0) + (width * (z - 1))) as usize;
            }
            if x < width - 1 && z > 0 {
                node.neighbor_idx.2 = ((x + 1) + (width * (z - 1))) as usize;
            }
            if x < width - 1 {
                node.neighbor_idx.3 = ((x + 1) + (width * (z - 0))) as usize;
            }
            if x < width - 1 && z < height - 1 {
                node.neighbor_idx.4 = ((x + 1) + (width * (z + 1))) as usize;
            }
            if z < height - 1 {
                node.neighbor_idx.5 = ((x - 0) + (width * (z + 1))) as usize;
            }
            if x > 0 && z < height - 1 {
                node.neighbor_idx.6 = ((x - 1) + (width * (z + 1))) as usize;
            }
            if x > 0 {
                node.neighbor_idx.7 = ((x - 1) + (width * (z - 0))) as usize;
            }
            nodes.push(node);
            i += 1;
            x += 1;
            if x == width {
                x = 0;
                z += 1;
                if z == height {
                    break;
                }
            }
        }
        Nogo {
            nodes,
            width: width as u32,
            height: height as u32,
            map_width: map_width as u32,
            map_height: map_height as u32,
            map_node_width,
            map_node_height,
            map_x_trans,
            map_z_trans,
        }
    }

    pub fn get_valid_node(
        &self,
        map_position: (f32, f32),
    ) -> (
        Option<&PathFindingNode>, // Node
        bool,                     // Is node found at target position or close to target
    ) {
        let x = self.map_x_trans.calc(map_position.0) as usize;
        let z = self.map_z_trans.calc(map_position.1) as usize;
        let chunk_idx = x + self.width as usize * z;
        if chunk_idx < self.nodes.len() {
            if self.nodes[chunk_idx].valid {
                return (Some(&self.nodes[chunk_idx]), true);
            } else {
                let mut offset: (i32, i32) = (-1, 1);
                let mut do_loop = true;
                while do_loop {
                    let mut found_valid_node = false;
                    for x_offs in offset.0..offset.1 {
                        for z_offs in offset.0..offset.1 {
                            let x = self.nodes[chunk_idx].position.0 as i32 + x_offs;
                            let z = self.nodes[chunk_idx].position.1 as i32 + z_offs;
                            let node_idx = (x as usize) + (self.width as usize * z as usize);
                            if node_idx < self.nodes.len() {
                                found_valid_node = true;
                                if self.nodes[node_idx].valid == true {
                                    return (Some(&self.nodes[node_idx]), false);
                                }
                            }
                        }
                    }
                    if found_valid_node == false {
                        do_loop = false;
                    }
                    offset.0 -= 1;
                    offset.1 += 1;
                }
            }
        }
        (None, false)
    }

    pub fn get_node_at_position(&self, position: (usize, usize)) -> Option<PathFindingNode> {
        for i in 0..self.nodes.len() {
            if position.0 == self.nodes[i].position.0 && position.1 == self.nodes[i].position.1 {
                return Some(self.nodes[i].clone());
            }
        }
        None
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