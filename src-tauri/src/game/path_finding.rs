use serde::{Deserialize, Serialize};

use super::nogo::Nogo;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct PathFindingNode {
    pub g: usize, // Distance from the start
    pub h: usize, // Distance from the end
    pub position: (usize, usize),
    pub map_position: (f32, f32),
    pub parent_idx: Option<usize>,
    pub neighbor_idx: (
        // tl
        usize,
        // tm
        usize,
        // tr
        usize,
        // mr
        usize,
        // br
        usize,
        // bm
        usize,
        // bl
        usize,
        // ml
        usize,
    ),
    pub valid: bool,
}

impl PathFindingNode {
    pub fn new(
        start: (usize, usize),
        position: (usize, usize),
        map_position: (f32, f32),
        end: (usize, usize),
        parent_idx: Option<usize>,
        neighbor_idx: (
            // tl
            usize,
            // tm
            usize,
            // tr
            usize,
            // mr
            usize,
            // br
            usize,
            // bm
            usize,
            // bl
            usize,
            // ml
            usize,
        ),
        valid: bool,
    ) -> PathFindingNode {
        let g = distance_between_points(start, position);
        let h = distance_between_points(position, end);
        PathFindingNode {
            g,
            h,
            position,
            map_position,
            parent_idx,
            neighbor_idx,
            valid,
        }
    }

    pub fn f(&self) -> usize {
        self.g + self.h
    }
}

fn lowest_f(nodes: &Vec<PathFindingNode>, nogo: &Nogo) -> (PathFindingNode, usize, usize) {
    let mut lowest_idx = 0;
    let mut lowest_f_vel: usize = 1000000000000;
    for i in 0..nodes.len() {
        if nodes[i].f() < lowest_f_vel {
            lowest_f_vel = nodes[i].f();
            lowest_idx = i;
        }
    }
    (
        nodes[lowest_idx].clone(),
        nodes[lowest_idx].position.0 + (nogo.width as usize) * nodes[lowest_idx].position.1,
        lowest_idx,
    )
}

fn is_in_set(node: &PathFindingNode, nodes: &Vec<PathFindingNode>) -> bool {
    for i in 0..nodes.len() {
        if nodes[i].position.0 == node.position.0 && nodes[i].position.1 == node.position.1 {
            return true;
        }
    }
    false
}

fn set_node_params(
    start: &PathFindingNode,
    end: &PathFindingNode,
    node: &PathFindingNode,
) -> PathFindingNode {
    let mut n = node.clone();
    n.g = distance_between_points(start.position, node.position);
    n.h = distance_between_points(node.position, end.position);
    n
}

fn get_neighbor_nodes(
    start: &PathFindingNode,
    end: &PathFindingNode,
    neighbor_idx: (
        // tl
        usize,
        // tm
        usize,
        // tr
        usize,
        // mr
        usize,
        // br
        usize,
        // bm
        usize,
        // bl
        usize,
        // ml
        usize,
    ),
    nodes: &Vec<PathFindingNode>,
) -> Vec<PathFindingNode> {
    let mut res: Vec<PathFindingNode> = vec![];
    if neighbor_idx.0 < 100000 {
        let node = &nodes[neighbor_idx.0];
        if node.valid {
            res.push(set_node_params(start, end, &node));
        }
    }
    if neighbor_idx.1 < 100000 {
        let node = &nodes[neighbor_idx.1];
        if node.valid {
            res.push(set_node_params(start, end, &node));
        }
    }
    if neighbor_idx.2 < 100000 {
        let node = &nodes[neighbor_idx.2];
        if node.valid {
            res.push(set_node_params(start, end, &node));
        }
    }
    if neighbor_idx.3 < 100000 {
        let node = &nodes[neighbor_idx.3];
        if node.valid {
            res.push(set_node_params(start, end, &node));
        }
    }
    if neighbor_idx.4 < 100000 {
        let node = &nodes[neighbor_idx.4];
        if node.valid {
            res.push(set_node_params(start, end, &node));
        }
    }
    if neighbor_idx.5 < 100000 {
        let node = &nodes[neighbor_idx.5];
        if node.valid {
            res.push(set_node_params(start, end, &node));
        }
    }
    if neighbor_idx.6 < 100000 {
        let node = &nodes[neighbor_idx.6];
        if node.valid {
            res.push(set_node_params(start, end, &node));
        }
    }
    if neighbor_idx.7 < 100000 {
        let node = &nodes[neighbor_idx.7];
        if node.valid {
            res.push(set_node_params(start, end, &node));
        }
    }
    res
}

fn distance_between_points(start: (usize, usize), end: (usize, usize)) -> usize {
    let x = end.0.abs_diff(start.0);
    let z = end.1.abs_diff(start.1);
    if x > z {
        return 14 * z + 10 * (x - z);
    }
    return 14 * x + 10 * (z - x);
}

pub fn get_node_at_position(
    position: (usize, usize),
    nodes: &Vec<PathFindingNode>,
) -> Option<PathFindingNode> {
    for i in 0..nodes.len() {
        if position.0 == nodes[i].position.0 && position.1 == nodes[i].position.1 {
            return Some(nodes[i].clone());
        }
    }
    None
}

fn resolve_path(
    start_node: &PathFindingNode,
    end_node: &PathFindingNode,
    nogo: &Nogo,
    closed_set: &Vec<PathFindingNode>,
) -> Vec<(f32, f32)> {
    let mut output: Vec<(f32, f32)> = vec![start_node.map_position];
    let mut current_node: PathFindingNode = start_node.clone();
    let mut do_loop = true;
    while do_loop == true {
        if current_node.position.0 == end_node.position.0
            && current_node.position.1 == end_node.position.1
        {
            do_loop = false;
        } else {
            match current_node.parent_idx {
                Some(parent_idx) => {
                    let node_opt =
                        get_node_at_position(nogo.nodes[parent_idx].position, &closed_set);
                    match node_opt {
                        Some(node) => {
                            output.push(node.map_position);
                            current_node = node;
                        }
                        None => {
                            do_loop = false;
                        }
                    }
                }
                None => {
                    do_loop = false;
                }
            }
        }
    }
    output.reverse();
    let to = output.len() - 1;
    output[1..to].to_vec()
}

pub fn a_star(map_start: (f32, f32), map_end: (f32, f32), nogo: &Nogo) -> Option<Vec<(f32, f32)>> {
    let start_node_opt = nogo.get_valid_node(map_start);
    match start_node_opt {
        Some(start_node) => {
            let end_node_opt = nogo.get_valid_node(map_end);
            match end_node_opt {
                Some(end_node) => {
                    let mut open_set: Vec<PathFindingNode> = vec![start_node.clone()];
                    let mut closed_set: Vec<PathFindingNode> = vec![];
                    let mut loops = 0;
                    while open_set.len() > 0 {
                        loops += 1;
                        let current_node = lowest_f(&open_set, nogo);
                        open_set.remove(current_node.2);
                        closed_set.push(current_node.0.clone());
                        if current_node.0.position.0 == end_node.position.0
                            && current_node.0.position.1 == end_node.position.1
                        {
                            return Some(resolve_path(
                                &current_node.0,
                                start_node,
                                nogo,
                                &closed_set,
                            ));
                        }
                        let mut neighbor_nodes = get_neighbor_nodes(
                            &start_node,
                            &end_node,
                            current_node.0.neighbor_idx,
                            &nogo.nodes,
                        );
                        for i in 0..neighbor_nodes.len() {
                            neighbor_nodes[i].parent_idx = Some(current_node.1);
                            if is_in_set(&neighbor_nodes[i], &closed_set) == false {
                                let new_move_cost = current_node.0.g
                                    + distance_between_points(
                                        current_node.0.position,
                                        neighbor_nodes[i].position,
                                    );
                                if new_move_cost < neighbor_nodes[i].g
                                    || is_in_set(&neighbor_nodes[i], &open_set) == false
                                {
                                    neighbor_nodes[i].g = new_move_cost;
                                    neighbor_nodes[i].h = distance_between_points(
                                        neighbor_nodes[i].position,
                                        end_node.position,
                                    );
                                    if is_in_set(&neighbor_nodes[i], &open_set) == false {
                                        open_set.push(neighbor_nodes[i].clone());
                                    }
                                }
                            }
                        }
                    }
                    println!(
                        "PF: no path found {:?},\n\n{:?},\n\n{:?}",
                        open_set, closed_set, loops
                    );
                }
                None => {
                    println!("PF: failed to find end node for {:?}", map_end);
                }
            }
        }
        None => {
            println!("PF: failed to find start node for {:?}", map_start);
        }
    }
    None
}
