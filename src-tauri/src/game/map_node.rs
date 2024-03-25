use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::game::map_info::MapInfo;
use crate::game::point::{Point, UPoint};

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export)]
pub struct MapNodeNeighborIdx {
    pub top_left: usize,
    pub top_mid: usize,
    pub top_right: usize,
    pub mid_right: usize,
    pub bottom_right: usize,
    pub bottom_mid: usize,
    pub bottom_left: usize,
    pub mid_left: usize,
}

impl MapNodeNeighborIdx {
    pub fn new(
        top_left: usize,
        top_mid: usize,
        top_right: usize,
        mid_right: usize,
        bottom_right: usize,
        bottom_mid: usize,
        bottom_left: usize,
        mid_left: usize,
    ) -> MapNodeNeighborIdx {
        MapNodeNeighborIdx {
            top_left,
            top_mid,
            top_right,
            mid_right,
            bottom_right,
            bottom_mid,
            bottom_left,
            mid_left,
        }
    }
}

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export)]
pub struct MapNode {
    pub g: usize,
    // Distance from the start
    pub h: usize,
    // Distance from the end
    pub v_position: UPoint,
    pub r_position: Point,
    pub parent_idx: Option<usize>,
    pub neighbor_idx: MapNodeNeighborIdx,
    pub walkable: bool,
}

impl MapNode {
    pub fn new(
        v_start: UPoint,
        v_end: UPoint,
        v_position: UPoint,
        r_position: Point,
        parent_idx: Option<usize>,
        neighbor_idx: MapNodeNeighborIdx,
        walkable: bool,
    ) -> MapNode {
        let g = MapInfo::distance_between_points(&v_start, &v_position);
        let h = MapInfo::distance_between_points(&v_position, &v_end);
        MapNode {
            g,
            h,
            v_position,
            r_position,
            walkable,
            neighbor_idx,
            parent_idx,
        }
    }

    pub fn f(&self) -> usize {
        self.g + self.h
    }
}
