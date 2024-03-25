use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::game::map_node::{MapNode, MapNodeNeighborIdx};
use crate::game::point::{Point, UPoint};
use crate::game::size::{Size, USize};
use crate::GameState;

use super::math::MathFnLinear2D;

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export)]
pub struct MapInfoRVTransform {
    pub x: MathFnLinear2D,
    pub y: MathFnLinear2D,
}

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export)]
pub struct MapInfo {
    pub nodes: Vec<MapNode>,
    pub v_size: USize,
    // Virtual map size
    pub r_size: Size,
    // Real map size
    pub r_node_size: Size,
    // Real node size on the map, in v_size node is always 1x1
    pub rv_transform: MapInfoRVTransform,
}

impl MapInfo {
    pub fn distance_between_points(start: &UPoint, end: &UPoint) -> usize {
        let x = end.x.abs_diff(start.x);
        let y = end.y.abs_diff(start.y);
        if x > y {
            return 14 * y + 10 * (x - y);
        }
        return 14 * x + 10 * (y - x);
    }

    pub fn new(
        pixels: Vec<u8>,
        v_size: USize,
        r_size: Size,
    ) -> MapInfo {
        let mut nodes: Vec<MapNode> = vec![];
        let mut i = 0;
        let mut x: usize = 0;
        let mut y: usize = 0;
        let rv_transform = MapInfoRVTransform {
            x: MathFnLinear2D::new(vec![Point::new(0.0, 0.0), Point::new(r_size.width, v_size.width as f32)]),
            y: MathFnLinear2D::new(vec![Point::new(0.0, 0.0), Point::new(r_size.height, v_size.height as f32)]),
        };
        let r_node_size = Size::new(rv_transform.x.inverse(1.0), rv_transform.y.inverse(1.0));
        while i < pixels.len() {
            let mut node = MapNode {
                v_position: UPoint::new(x, y),
                r_position: Point::new(rv_transform.x.inverse(x as f32) + r_node_size.width / 2.0, rv_transform.y.inverse(y as f32) + r_node_size.height / 2.0),
                g: 0,
                h: 0,
                parent_idx: None,
                walkable: false,
                neighbor_idx: MapNodeNeighborIdx::new(
                    1000000000,
                    1000000000,
                    1000000000,
                    1000000000,
                    1000000000,
                    1000000000,
                    1000000000,
                    1000000000,
                ),
            };
            if pixels[i] < 200 {
                node.walkable = true;
            }
            if x > 0 && y > 0 {
                node.neighbor_idx.top_left = ((x - 1) + (v_size.width * (y - 1))) as usize;
            }
            if y > 0 {
                node.neighbor_idx.top_mid = ((x - 0) + (v_size.width * (y - 1))) as usize;
            }
            if x < v_size.width - 1 && y > 0 {
                node.neighbor_idx.top_right = ((x + 1) + (v_size.width * (y - 1))) as usize;
            }
            if x < v_size.width - 1 {
                node.neighbor_idx.mid_right = ((x + 1) + (v_size.width * (y - 0))) as usize;
            }
            if x < v_size.width - 1 && y < v_size.height - 1 {
                node.neighbor_idx.bottom_right = ((x + 1) + (v_size.width * (y + 1))) as usize;
            }
            if y < v_size.height - 1 {
                node.neighbor_idx.bottom_mid = ((x - 0) + (v_size.width * (y + 1))) as usize;
            }
            if x > 0 && y < v_size.height - 1 {
                node.neighbor_idx.bottom_left = ((x - 1) + (v_size.width * (y + 1))) as usize;
            }
            if x > 0 {
                node.neighbor_idx.mid_left = ((x - 1) + (v_size.width * (y - 0))) as usize;
            }
            nodes.push(node);
            i += 1;
            x += 1;
            if x == v_size.width {
                x = 0;
                y += 1;
                if y == v_size.height {
                    break;
                }
            }
        }
        MapInfo {
            nodes,
            v_size,
            r_size,
            rv_transform,
            r_node_size,
        }
    }

    pub fn get_valid_node(
        &self,
        map_position: &Point,
    ) -> (
        Option<&MapNode>, // Node
        bool,                     // Is node found at target position or close to target
    ) {
        let x = self.rv_transform.x.calc(map_position.x) as usize;
        let y = self.rv_transform.y.calc(map_position.y) as usize;
        let chunk_idx = x + self.v_size.width * y;
        if chunk_idx < self.nodes.len() {
            if self.nodes[chunk_idx].walkable {
                return (Some(&self.nodes[chunk_idx]), true);
            } else {
                let mut offset: (i32, i32) = (-1, 1);
                let mut do_loop = true;
                while do_loop {
                    let mut found_valid_node = false;
                    for x_offs in offset.0..offset.1 {
                        for z_offs in offset.0..offset.1 {
                            let x = self.nodes[chunk_idx].v_position.x as i32 + x_offs;
                            let z = self.nodes[chunk_idx].v_position.y as i32 + z_offs;
                            let node_idx = (x as usize) + (self.v_size.width as usize * z as usize);
                            if node_idx < self.nodes.len() {
                                found_valid_node = true;
                                if self.nodes[node_idx].walkable == true {
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

    pub fn get_node_at_position(&self, position: UPoint) -> Option<MapNode> {
        for i in 0..self.nodes.len() {
            if position.x == self.nodes[i].v_position.x && position.y == self.nodes[i].v_position.y {
                return Some(self.nodes[i].clone());
            }
        }
        None
    }
}

#[tauri::command]
pub fn map_info_set(state: tauri::State<GameState>, pixels: Vec<u8>, map_slug: &str) -> MapInfo {
    let mut state_guard = state.0.lock().unwrap();
    let map_data_opt = state_guard.find_map(map_slug);
    match map_data_opt {
        Some(map_data) => {
            state_guard.map_info = MapInfo::new(
                pixels,
                USize::new(
                    map_data.nogo.width as usize,
                    map_data.nogo.height as usize,
                ),
                Size::new(
                    map_data.width as f32,
                    map_data.height as f32,
                ),
            );
            return state_guard.map_info.clone();
        }
        None => {
            panic!("Map info: Map '{}' does not exist.", map_slug);
        }
    }
}
