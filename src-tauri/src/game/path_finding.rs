use crate::game::map_info::MapInfo;
use crate::game::map_node::{MapNode, MapNodeNeighborIdx};
use crate::game::point::{Point, UPoint};

fn lowest_f(nodes: &Vec<MapNode>, map_info: &MapInfo) -> (MapNode, usize, usize) {
    let mut lowest_idx = 0;
    let mut lowest_f_vel: usize = 1000000000000;
    for i in 0..nodes.len() {
        if nodes[i].f() < lowest_f_vel {
            lowest_f_vel = nodes[i].f();
            lowest_idx = i;
        } else if nodes[i].f() == lowest_f_vel && nodes[i].g < nodes[lowest_idx].g {
            lowest_idx = i;
        }
    }
    (
        nodes[lowest_idx].clone(),
        nodes[lowest_idx].v_position.x + (map_info.v_size.width) * nodes[lowest_idx].v_position.y,
        lowest_idx,
    )
}

fn is_in_set(node: &MapNode, nodes: &Vec<MapNode>) -> usize {
    for i in 0..nodes.len() {
        if nodes[i].v_position.x == node.v_position.x && nodes[i].v_position.y == node.v_position.y {
            return i;
        }
    }
    1000000
}

fn set_node_params(
    start: &MapNode,
    end: &MapNode,
    node: &MapNode,
) -> MapNode {
    let mut n = node.clone();
    n.g = MapInfo::distance_between_points(&start.v_position, &node.v_position);
    n.h = MapInfo::distance_between_points(&node.v_position, &end.v_position);
    n
}

fn get_neighbor_nodes(
    start: &MapNode,
    end: &MapNode,
    neighbor_idx: MapNodeNeighborIdx,
    nodes: &Vec<MapNode>,
) -> Vec<MapNode> {
    let mut res: Vec<MapNode> = vec![];
    if neighbor_idx.top_left < 100000000 {
        let node = &nodes[neighbor_idx.top_left];
        if node.walkable {
            res.push(set_node_params(start, end, &node));
        }
    }
    if neighbor_idx.top_mid < 100000000 {
        let node = &nodes[neighbor_idx.top_mid];
        if node.walkable {
            res.push(set_node_params(start, end, &node));
        }
    }
    if neighbor_idx.top_right < 100000000 {
        let node = &nodes[neighbor_idx.top_right];
        if node.walkable {
            res.push(set_node_params(start, end, &node));
        }
    }
    if neighbor_idx.mid_right < 100000000 {
        let node = &nodes[neighbor_idx.mid_right];
        if node.walkable {
            res.push(set_node_params(start, end, &node));
        }
    }
    if neighbor_idx.bottom_right < 100000000 {
        let node = &nodes[neighbor_idx.bottom_right];
        if node.walkable {
            res.push(set_node_params(start, end, &node));
        }
    }
    if neighbor_idx.bottom_mid < 100000000 {
        let node = &nodes[neighbor_idx.bottom_mid];
        if node.walkable {
            res.push(set_node_params(start, end, &node));
        }
    }
    if neighbor_idx.bottom_left < 100000000 {
        let node = &nodes[neighbor_idx.bottom_left];
        if node.walkable {
            res.push(set_node_params(start, end, &node));
        }
    }
    if neighbor_idx.mid_left < 100000000 {
        let node = &nodes[neighbor_idx.mid_left];
        if node.walkable {
            res.push(set_node_params(start, end, &node));
        }
    }
    res
}

pub fn get_node_at_position(
    position: &UPoint,
    nodes: &Vec<MapNode>,
) -> Option<MapNode> {
    for i in 0..nodes.len() {
        if position.x == nodes[i].v_position.x && position.y == nodes[i].v_position.y {
            return Some(nodes[i].clone());
        }
    }
    None
}

fn resolve_path(
    start_node: &MapNode,
    end_node: &MapNode,
    map_info: &MapInfo,
    closed_set: &Vec<MapNode>,
) -> Vec<Point> {
    let mut output: Vec<Point> = vec![start_node.r_position.clone()];
    let mut current_node: MapNode = start_node.clone();
    let mut do_loop = true;
    while do_loop == true {
        if current_node.v_position.x == end_node.v_position.x
            && current_node.v_position.y == end_node.v_position.y
        {
            do_loop = false;
        } else {
            match current_node.parent_idx {
                Some(parent_idx) => {
                    let node_opt =
                        get_node_at_position(&map_info.nodes[parent_idx].v_position, &closed_set);
                    match node_opt {
                        Some(node) => {
                            output.push(node.r_position.clone());
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

pub fn a_star(
    map_start: &Point,
    map_end: &Point,
    map_info: &MapInfo,
) -> (
    Option<Vec<Point>>, // Path to follow
    bool,                    // Is end position valid
) {
    let start_node_opt = map_info.get_valid_node(map_start);
    match start_node_opt.0 {
        Some(start_node) => {
            let end_node_opt = map_info.get_valid_node(map_end);
            match end_node_opt.0 {
                Some(end_node) => {
                    if start_node.v_position.x == end_node.v_position.x
                        && start_node.v_position.y == end_node.v_position.y
                    {
                        return (Some(vec![]), true);
                    }
                    let mut open_set: Vec<MapNode> = vec![start_node.clone()];
                    let mut closed_set: Vec<MapNode> = vec![];
                    let mut loops = 0;
                    while open_set.len() > 0 {
                        loops += 1;
                        let current_node = lowest_f(&open_set, map_info);
                        open_set.remove(current_node.2);
                        closed_set.push(current_node.0.clone());
                        if current_node.0.v_position.x == end_node.v_position.x
                            && current_node.0.v_position.y == end_node.v_position.y
                        {
                            return (
                                Some(resolve_path(&current_node.0, start_node, map_info, &closed_set)),
                                end_node_opt.1,
                            );
                        }
                        let mut neighbor_nodes = get_neighbor_nodes(
                            &start_node,
                            &end_node,
                            current_node.0.neighbor_idx,
                            &map_info.nodes,
                        );
                        for i in 0..neighbor_nodes.len() {
                            neighbor_nodes[i].parent_idx = Some(current_node.1);
                            if is_in_set(&neighbor_nodes[i], &closed_set) == 1000000 {
                                let new_move_cost = current_node.0.g
                                    + MapInfo::distance_between_points(
                                    &current_node.0.v_position,
                                    &neighbor_nodes[i].v_position,
                                );
                                let neighbor_node_in_open_set_idx =
                                    is_in_set(&neighbor_nodes[i], &open_set);
                                if neighbor_node_in_open_set_idx == 1000000 {
                                    neighbor_nodes[i].g = new_move_cost;
                                    neighbor_nodes[i].h = MapInfo::distance_between_points(
                                        &neighbor_nodes[i].v_position,
                                        &end_node.v_position,
                                    );
                                    open_set.push(neighbor_nodes[i].clone());
                                } else if new_move_cost < open_set[neighbor_node_in_open_set_idx].g
                                {
                                    open_set[neighbor_node_in_open_set_idx].g = new_move_cost;
                                    open_set[neighbor_node_in_open_set_idx].h =
                                        MapInfo::distance_between_points(
                                            &neighbor_nodes[i].v_position,
                                            &end_node.v_position,
                                        );
                                    open_set[neighbor_node_in_open_set_idx].parent_idx =
                                        Some(current_node.1);
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
    (None, false)
}
