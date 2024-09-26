import type { USize, UPoint } from '../types/rs';

const INVALID_NODE_IDX = 4000000000;

interface NodeNeighbors {
    top_left: number;
    top_mid: number;
    top_right: number;
    mid_right: number;
    bottom_right: number;
    bottom_mid: number;
    bottom_left: number;
    mid_left: number;
}

export class Node {
    constructor(
        public g: number,
        // Distance from the start
        public h: number,
        // Distance from the end
        public position: UPoint,
        public parent_idx: number,
        public neighbor_idx: NodeNeighbors,
        public walkable: boolean,
    ) {}

    f() {
        return this.g + this.h;
    }

    clone(): Node {
        return new Node(
            this.g,
            this.h,
            {
                x: this.position.x,
                y: this.position.y,
            },
            this.parent_idx,
            JSON.parse(JSON.stringify(this.neighbor_idx)),
            this.walkable,
        );
    }
}

function distance_between_points(start: UPoint, end: UPoint): number {
    const x = Math.abs(end.x - start.x);
    const y = Math.abs(end.y - start.y);
    let result = 0;
    if (x > y) {
        result = 14 * y + 10 * (x - y);
    } else {
        result = 14 * x + 10 * (y - x);
    }
    return result;
}

function create_nodes(nav_mesh: number[], map_size: USize): Node[] {
    const nodes: Node[] = [];
    let i = 0;
    let x = 0;
    let y = 0;
    let loops = 0;
    while (i < nav_mesh.length) {
        loops += 1;
        const node = new Node(
            0,
            0,
            { x, y },
            INVALID_NODE_IDX,
            {
                bottom_left: INVALID_NODE_IDX,
                bottom_mid: INVALID_NODE_IDX,
                bottom_right: INVALID_NODE_IDX,
                mid_left: INVALID_NODE_IDX,
                mid_right: INVALID_NODE_IDX,
                top_left: INVALID_NODE_IDX,
                top_mid: INVALID_NODE_IDX,
                top_right: INVALID_NODE_IDX,
            },
            nav_mesh[i] > 0,
        );
        if (x > 0 && y > 0) {
            node.neighbor_idx.top_left = x - 1 + map_size.width * (y - 1);
        }
        if (y > 0) {
            node.neighbor_idx.top_mid = x - 0 + map_size.width * (y - 1);
        }
        if (x < map_size.width - 1 && y > 0) {
            node.neighbor_idx.top_right = x + 1 + map_size.width * (y - 1);
        }
        if (x < map_size.width - 1) {
            node.neighbor_idx.mid_right = x + 1 + map_size.width * (y - 0);
        }
        if (x < map_size.width - 1 && y < map_size.height - 1) {
            node.neighbor_idx.bottom_right = x + 1 + map_size.width * (y + 1);
        }
        if (y < map_size.height - 1) {
            node.neighbor_idx.bottom_mid = x - 0 + map_size.width * (y + 1);
        }
        if (x > 0 && y < map_size.height - 1) {
            node.neighbor_idx.bottom_left = x - 1 + map_size.width * (y + 1);
        }
        if (x > 0) {
            node.neighbor_idx.mid_left = x - 1 + map_size.width * (y - 0);
        }
        nodes.push(node);
        i += 1;
        x += 1;
        if (x == map_size.width) {
            x = 0;
            y += 1;
            if (y == map_size.height) {
                break;
            }
        }
    }
    return nodes;
}

function lowest_f(
    set_nodes: Node[],
    map_size: USize,
): [
    // Found node with lowest F
    Node,
    // In all nodes IDX
    number,
    // In set node IDX
    number,
] {
    let lowest_idx = 0;
    let lowest_f_vel = INVALID_NODE_IDX;
    for (let i = 0; i < set_nodes.length; i++) {
        if (set_nodes[i].f() < lowest_f_vel) {
            lowest_f_vel = set_nodes[i].f();
            lowest_idx = i;
        } else if (
            set_nodes[i].f() == lowest_f_vel &&
            set_nodes[i].g < set_nodes[lowest_idx].g
        ) {
            lowest_idx = i;
        }
    }
    return [
        set_nodes[lowest_idx],
        set_nodes[lowest_idx].position.x +
            map_size.width * set_nodes[lowest_idx].position.y,
        lowest_idx,
    ];
}

function get_node_at_position(position: UPoint, nodes: Node[]): Node | null {
    for (let i = 0; i < nodes.length; i++) {
        if (
            position.x === nodes[i].position.x &&
            position.y === nodes[i].position.y
        ) {
            return nodes[i].clone();
        }
    }
    return null;
}

function set_node_params(start: Node, end: Node, node: Node): Node {
    const n = node.clone();
    n.g = distance_between_points(start.position, node.position);
    n.h = distance_between_points(node.position, end.position);
    return n;
}

function get_neighbor_nodes(
    start: Node,
    end: Node,
    neighbor_idx: NodeNeighbors,
    nodes: Node[],
): Node[] {
    const res: Node[] = [];
    if (neighbor_idx.top_left < INVALID_NODE_IDX) {
        const node = nodes[neighbor_idx.top_left];
        if (node.walkable) {
            res.push(set_node_params(start, end, node));
        }
    }
    if (neighbor_idx.top_mid < INVALID_NODE_IDX) {
        const node = nodes[neighbor_idx.top_mid];
        if (node.walkable) {
            res.push(set_node_params(start, end, node));
        }
    }
    if (neighbor_idx.top_right < INVALID_NODE_IDX) {
        const node = nodes[neighbor_idx.top_right];
        if (node.walkable) {
            res.push(set_node_params(start, end, node));
        }
    }
    if (neighbor_idx.mid_right < INVALID_NODE_IDX) {
        const node = nodes[neighbor_idx.mid_right];
        if (node.walkable) {
            res.push(set_node_params(start, end, node));
        }
    }
    if (neighbor_idx.bottom_right < INVALID_NODE_IDX) {
        const node = nodes[neighbor_idx.bottom_right];
        if (node.walkable) {
            res.push(set_node_params(start, end, node));
        }
    }
    if (neighbor_idx.bottom_mid < INVALID_NODE_IDX) {
        const node = nodes[neighbor_idx.bottom_mid];
        if (node.walkable) {
            res.push(set_node_params(start, end, node));
        }
    }
    if (neighbor_idx.bottom_left < INVALID_NODE_IDX) {
        const node = nodes[neighbor_idx.bottom_left];
        if (node.walkable) {
            res.push(set_node_params(start, end, node));
        }
    }
    if (neighbor_idx.mid_left < INVALID_NODE_IDX) {
        const node = nodes[neighbor_idx.mid_left];
        if (node.walkable) {
            res.push(set_node_params(start, end, node));
        }
    }
    return res;
}

function is_in_set(node: Node, nodes: Node[]): number {
    for (let i = 0; i < nodes.length; i++) {
        if (
            nodes[i].position.x === node.position.x &&
            nodes[i].position.y === node.position.y
        ) {
            return i;
        }
    }
    return INVALID_NODE_IDX;
}

function find_valid_node(
    position: UPoint,
    nodes: Node[],
    map_size: USize,
): [number, boolean] {
    let node_idx = position.x + map_size.width * position.y;
    if (node_idx < nodes.length) {
        if (nodes[node_idx].walkable) {
            return [node_idx, true];
        }
        const offset: [number, number] = [-1, 1];
        let do_loop = true;
        while (do_loop) {
            let found_valid_node = false;
            for (let x_offs = offset[0]; x_offs <= offset[1]; x_offs++) {
                for (let y_offs = offset[0]; y_offs <= offset[1]; y_offs++) {
                    if (node_idx < 0) {
                        console.log({ node_idx, map_size });
                    }
                    const x = nodes[node_idx].position.x + x_offs;
                    const y = nodes[node_idx].position.y + y_offs;
                    if (x < 0 || y < 0) {
                        continue;
                    }
                    node_idx = x + map_size.width * y;
                    if (node_idx > -1 && node_idx < nodes.length) {
                        found_valid_node = true;
                        if (nodes[node_idx].walkable) {
                            return [node_idx, false];
                        }
                    }
                }
            }
            if (found_valid_node === false) {
                do_loop = false;
            }
            offset[0] -= 1;
            offset[1] += 1;
        }
    }
    return [INVALID_NODE_IDX, false];
}

function resolve_path(
    start_node: Node,
    end_node: Node,
    nodes: Node[],
    closed_set: Node[],
): UPoint[] {
    const output: UPoint[] = [start_node.position];
    let current_node = start_node.clone();
    let do_loop = true;
    while (do_loop) {
        if (
            current_node.position.x === end_node.position.x &&
            current_node.position.y === end_node.position.y
        ) {
            do_loop = false;
        } else {
            if (current_node.parent_idx !== INVALID_NODE_IDX) {
                const node = get_node_at_position(
                    nodes[current_node.parent_idx].position,
                    closed_set,
                );
                if (node) {
                    output.push(node.position);
                    current_node = node;
                } else {
                    do_loop = false;
                }
            } else {
                do_loop = false;
            }
        }
    }
    output.reverse();
    return output;
}

export async function a_star(
    start_raw: UPoint,
    end_raw: UPoint,
    nav_mesh: number[],
    map_size: USize,
): Promise<[UPoint[] | null, boolean, Node[]]> {
    const nodes = create_nodes(nav_mesh, map_size);
    const start: UPoint = {
        x: parseInt(`${start_raw.x}`),
        y: parseInt(`${start_raw.y}`),
    };
    const end: UPoint = {
        x: parseInt(`${end_raw.x}`),
        y: parseInt(`${end_raw.y}`),
    };
    const start_node = nodes[start.x + start.y * map_size.width];
    const end_node_idx = find_valid_node(end, nodes, map_size);
    if (end_node_idx[0] === INVALID_NODE_IDX) {
        return [null, false, []];
    }
    const end_node = nodes[end_node_idx[0]];
    const open_set: Node[] = [start_node];
    const closed_set: Node[] = [];
    while (open_set.length > 0) {
        const current_node = lowest_f(open_set, map_size);
        open_set.splice(current_node[2], 1);
        closed_set.push(current_node[0].clone());
        if (
            current_node[0].position.x === end_node.position.x &&
            current_node[0].position.y === end_node.position.y
        ) {
            return [
                resolve_path(current_node[0], start_node, nodes, closed_set),
                true,
                closed_set,
            ];
        }
        const neighbor_nodes = get_neighbor_nodes(
            start_node,
            end_node,
            current_node[0].neighbor_idx,
            nodes,
        );
        for (let i = 0; i < neighbor_nodes.length; i++) {
            neighbor_nodes[i].parent_idx = current_node[1];
            if (is_in_set(neighbor_nodes[i], closed_set) !== INVALID_NODE_IDX) {
                continue;
            }
            const new_move_cost =
                current_node[0].g +
                distance_between_points(
                    current_node[0].position,
                    neighbor_nodes[i].position,
                );
            const neighbor_node_in_open_set_idx = is_in_set(
                neighbor_nodes[i],
                open_set,
            );
            if (neighbor_node_in_open_set_idx === INVALID_NODE_IDX) {
                neighbor_nodes[i].g = new_move_cost;
                neighbor_nodes[i].h = distance_between_points(
                    neighbor_nodes[i].position,
                    end_node.position,
                );
                open_set.push(neighbor_nodes[i].clone());
            } else if (
                new_move_cost < open_set[neighbor_node_in_open_set_idx].g
            ) {
                open_set[neighbor_node_in_open_set_idx].g = new_move_cost;
                open_set[neighbor_node_in_open_set_idx].h =
                    distance_between_points(
                        neighbor_nodes[i].position,
                        end_node.position,
                    );
                open_set[neighbor_node_in_open_set_idx].parent_idx =
                    current_node[1];
            }
        }
    }
    return [null, false, []];
}
