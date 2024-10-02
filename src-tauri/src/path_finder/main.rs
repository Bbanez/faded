use crate::util::math::{UPoint, USize};

const INVALID_NODE_IDX: usize = 4000000000;

#[derive(Clone, Debug)]
struct NodeNeighbors {
    pub top_left: usize,
    pub top_mid: usize,
    pub top_right: usize,
    pub mid_right: usize,
    pub bottom_right: usize,
    pub bottom_mid: usize,
    pub bottom_left: usize,
    pub mid_left: usize,
}

#[derive(Clone, Debug)]
struct Node {
    // Distance from the start
    pub g: usize,
    // Distance from the end
    pub h: usize,
    pub position: UPoint,
    pub parent_idx: usize,
    pub neighbor_idx: NodeNeighbors,
    pub walkable: bool,
}

impl Node {
    pub fn f(&self) -> usize {
        self.g + self.h
    }
}

fn distance_between_points(start: &UPoint, end: &UPoint) -> usize {
    let x = end.x.abs_diff(start.x);
    let y = end.y.abs_diff(start.y);
    let result: usize;
    if x > y {
        result = 14 * y + 10 * (x - y);
    } else {
        result = 14 * x + 10 * (y - x);
    }
    result
}

fn create_nodes(nav_mesh: &Vec<u8>, map_size: &USize) -> Vec<Node> {
    let mut nodes: Vec<Node> = vec![];
    let mut i = 0;
    let mut x = 0;
    let mut y = 0;
    while i < nav_mesh.len() {
        let mut node = Node {
            g: 0,
            h: 0,
            position: UPoint { x, y },
            parent_idx: INVALID_NODE_IDX,
            neighbor_idx: NodeNeighbors {
                bottom_left: INVALID_NODE_IDX,
                bottom_mid: INVALID_NODE_IDX,
                bottom_right: INVALID_NODE_IDX,
                mid_left: INVALID_NODE_IDX,
                mid_right: INVALID_NODE_IDX,
                top_left: INVALID_NODE_IDX,
                top_mid: INVALID_NODE_IDX,
                top_right: INVALID_NODE_IDX,
            },
            walkable: nav_mesh[i] > 0,
        };
        if x > 0 && y > 0 {
            node.neighbor_idx.top_left = x - 1 + map_size.width * (y - 1);
        }
        if y > 0 {
            node.neighbor_idx.top_mid = x - 0 + map_size.width * (y - 1);
        }
        if x < map_size.width - 1 && y > 0 {
            node.neighbor_idx.top_right = x + 1 + map_size.width * (y - 1);
        }
        if x < map_size.width - 1 {
            node.neighbor_idx.mid_right = x + 1 + map_size.width * (y - 0);
        }
        if x < map_size.width - 1 && y < map_size.height - 1 {
            node.neighbor_idx.bottom_right = x + 1 + map_size.width * (y + 1);
        }
        if y < map_size.height - 1 {
            node.neighbor_idx.bottom_mid = x - 0 + map_size.width * (y + 1);
        }
        if x > 0 && y < map_size.height - 1 {
            node.neighbor_idx.bottom_left = x - 1 + map_size.width * (y + 1);
        }
        if x > 0 {
            node.neighbor_idx.mid_left = x - 1 + map_size.width * (y - 0);
        }
        nodes.push(node);
        i += 1;
        x += 1;
        if x == map_size.width {
            x = 0;
            y += 1;
            if y == map_size.height {
                break;
            }
        }
    }
    nodes
}

fn lowest_f(
    set_nodes: &Vec<Node>,
    map_size: &USize,
) -> (
    // Found node with lowest F
    Node,
    // In all nodes IDX
    usize,
    // In set node IDX
    usize,
) {
    let mut lowest_idx = 0;
    let mut lowest_f_vel = INVALID_NODE_IDX;
    for i in 0..set_nodes.len() {
        if set_nodes[i].f() < lowest_f_vel {
            lowest_f_vel = set_nodes[i].f();
            lowest_idx = i;
        } else if set_nodes[i].f() == lowest_f_vel && set_nodes[i].g < set_nodes[lowest_idx].g {
            lowest_idx = i;
        }
    }
    (
        set_nodes[lowest_idx].clone(),
        set_nodes[lowest_idx].position.x + map_size.width * set_nodes[lowest_idx].position.y,
        lowest_idx,
    )
}

fn get_node_at_position(position: &UPoint, nodes: &Vec<Node>) -> usize {
    for i in 0..nodes.len() {
        if position.x == nodes[i].position.x && position.y == nodes[i].position.y {
            return i;
        }
    }
    INVALID_NODE_IDX
}

fn set_node_params(start: &Node, end: &Node, node: &Node) -> Node {
    let mut n = node.clone();
    n.g = distance_between_points(&start.position, &node.position);
    n.h = distance_between_points(&node.position, &end.position);
    n
}

fn get_neighbor_nodes(
    start: &Node,
    end: &Node,
    neighbor_idx: &NodeNeighbors,
    nodes: &Vec<Node>,
) -> Vec<Node> {
    let mut res: Vec<Node> = vec![];
    if neighbor_idx.top_left < INVALID_NODE_IDX && neighbor_idx.top_left < nodes.len() {
        let node = &nodes[neighbor_idx.top_left];
        if node.walkable {
            res.push(set_node_params(start, end, node));
        }
    }
    if neighbor_idx.top_mid < INVALID_NODE_IDX && neighbor_idx.top_mid < nodes.len() {
        let node = &nodes[neighbor_idx.top_mid];
        if node.walkable {
            res.push(set_node_params(start, end, node));
        }
    }
    if neighbor_idx.top_right < INVALID_NODE_IDX && neighbor_idx.top_right < nodes.len() {
        let node = &nodes[neighbor_idx.top_right];
        if node.walkable {
            res.push(set_node_params(start, end, node));
        }
    }
    if neighbor_idx.mid_right < INVALID_NODE_IDX && neighbor_idx.mid_right < nodes.len() {
        let node = &nodes[neighbor_idx.mid_right];
        if node.walkable {
            res.push(set_node_params(start, end, node));
        }
    }
    if neighbor_idx.bottom_right < INVALID_NODE_IDX && neighbor_idx.bottom_right < nodes.len() {
        let node = &nodes[neighbor_idx.bottom_right];
        if node.walkable {
            res.push(set_node_params(start, end, node));
        }
    }
    if neighbor_idx.bottom_mid < INVALID_NODE_IDX && neighbor_idx.bottom_mid < nodes.len() {
        let node = &nodes[neighbor_idx.bottom_mid];
        if node.walkable {
            res.push(set_node_params(start, end, node));
        }
    }
    if neighbor_idx.bottom_left < INVALID_NODE_IDX && neighbor_idx.bottom_left< nodes.len() {
        let node = &nodes[neighbor_idx.bottom_left];
        if node.walkable {
            res.push(set_node_params(start, end, node));
        }
    }
    if neighbor_idx.mid_left < INVALID_NODE_IDX && neighbor_idx.mid_left < nodes.len() {
        let node = &nodes[neighbor_idx.mid_left];
        if node.walkable {
            res.push(set_node_params(start, end, node));
        }
    }
    res
}

fn is_in_set(node: &Node, nodes: &Vec<Node>) -> usize {
    for i in 0..nodes.len() {
        if nodes[i].position.x == node.position.x && nodes[i].position.y == node.position.y {
            return i;
        }
    }
    INVALID_NODE_IDX
}

fn find_valid_node(position: &UPoint, nodes: &Vec<Node>, map_size: &USize) -> (usize, bool) {
    let mut node_idx = position.x + map_size.width * position.y;
    if node_idx < nodes.len() {
        if nodes[node_idx].walkable {
            return (node_idx, true);
        }
        let mut offset: (i32, i32) = (-1, 1);
        let mut do_loop = true;
        while do_loop {
            let mut found_valid_node = false;
            for x_offs in offset.0..offset.1 {
                for y_offs in offset.0..offset.1 {
                    let x = nodes[node_idx].position.x as i32 + x_offs;
                    let y = nodes[node_idx].position.y as i32 + y_offs;
                    if x < 0 || y < 0 {
                        continue;
                    }
                    node_idx = x as usize + map_size.width * y as usize;
                    if node_idx < nodes.len() {
                        found_valid_node = true;
                        if nodes[node_idx].walkable {
                            return (node_idx, false);
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
    (INVALID_NODE_IDX, false)
}

fn resolve_path(
    start_node: &Node,
    end_node: &Node,
    nodes: &Vec<Node>,
    closed_set: &Vec<Node>,
) -> Vec<UPoint> {
    let mut output: Vec<UPoint> = vec![start_node.position.clone()];
    let mut current_node = start_node.clone();
    let mut do_loop = true;
    while do_loop {
        if current_node.position.x == end_node.position.x
            && current_node.position.y == end_node.position.y
        {
            do_loop = false;
        } else {
            if current_node.parent_idx != INVALID_NODE_IDX {
                let node_idx =
                    get_node_at_position(&nodes[current_node.parent_idx].position, closed_set);
                if node_idx != INVALID_NODE_IDX {
                    output.push(closed_set[node_idx].position.clone());
                    current_node = closed_set[node_idx].clone();
                } else {
                    do_loop = false;
                }
            } else {
                do_loop = false;
            }
        }
    }
    output.reverse();
    output.remove(0);
    output.remove(output.len() - 1);
    output
}

pub fn a_star(
    start: &UPoint,
    end: &UPoint,
    nav_mesh: &Vec<u8>,
    map_size: &USize,
) -> (Option<Vec<UPoint>>, bool) {
    let nodes = create_nodes(nav_mesh, map_size);
    let start_node = &nodes[start.x + start.y * map_size.width];
    let end_node_idx = find_valid_node(end, &nodes, map_size);
    if end_node_idx.0 == INVALID_NODE_IDX {
        return (None, false);
    }
    let end_node = &nodes[end_node_idx.0];
    let mut open_set: Vec<Node> = vec![start_node.clone()];
    let mut closed_set: Vec<Node> = vec![];
    while open_set.len() > 0 {
        let current_node = lowest_f(&open_set, map_size);
        open_set.remove(current_node.2);
        closed_set.push(current_node.0.clone());
        if current_node.0.position.x == end_node.position.x
            && current_node.0.position.y == end_node.position.y
        {
            return (
                Some(resolve_path(
                    &current_node.0,
                    &start_node,
                    &nodes,
                    &closed_set,
                )),
                true,
            );
        }
        let mut neighbor_nodes =
            get_neighbor_nodes(&start_node, &end_node, &current_node.0.neighbor_idx, &nodes);
        for i in 0..neighbor_nodes.len() {
            neighbor_nodes[i].parent_idx = current_node.1;
            if is_in_set(&neighbor_nodes[i], &closed_set) != INVALID_NODE_IDX {
                continue;
            }
            let new_move_cost = current_node.0.g
                + distance_between_points(&current_node.0.position, &neighbor_nodes[i].position);
            let neighbor_node_in_open_set_idx = is_in_set(&neighbor_nodes[i], &open_set);
            if neighbor_node_in_open_set_idx == INVALID_NODE_IDX {
                neighbor_nodes[i].g = new_move_cost;
                neighbor_nodes[i].h =
                    distance_between_points(&neighbor_nodes[i].position, &end_node.position);
                open_set.push(neighbor_nodes[i].clone());
            } else if new_move_cost < open_set[neighbor_node_in_open_set_idx].g {
                open_set[neighbor_node_in_open_set_idx].g = new_move_cost;
                open_set[neighbor_node_in_open_set_idx].h =
                    distance_between_points(&neighbor_nodes[i].position, &end_node.position);
                open_set[neighbor_node_in_open_set_idx].parent_idx = current_node.1;
            }
        }
    }
    (None, false)
}
