import { Mesh, MeshBasicMaterial, PlaneGeometry } from 'three';
import { RustNogo, RustPathFindingNode } from '../types';
import { Game } from './main';
import { PI12 } from './consts';

interface LocalNode extends RustPathFindingNode {
  f(): number;
  clone(): LocalNode;
  plane: Mesh;
}

function to_locale_node(node: RustPathFindingNode, nogo: RustNogo): LocalNode {
  const new_node = JSON.parse(JSON.stringify(node));
  const plane =
    ((node as any).plane as Mesh) ||
    new Mesh(
      new PlaneGeometry(nogo.map_node_width, nogo.map_node_height),
      new MeshBasicMaterial({
        color: 0x00ff00,
      }),
    );
  if (!(node as any).plane) {
    plane.position.set(node.map_position[0], 10, node.map_position[1]);
    plane.rotation.x = -PI12;
  }
  const self: LocalNode = {
    ...new_node,
    plane,
    f() {
      return new_node.g + new_node.h;
    },
    clone() {
      return to_locale_node(self, nogo);
    },
  };
  return self;
}

function lowest_f(
  nodes: LocalNode[],
  nogo: RustNogo,
): [LocalNode, number, number] {
  let lowest_idx = 0;
  let lowest_f_vel = 1000000000;
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].f() < lowest_f_vel) {
      lowest_f_vel = nodes[i].f();
      lowest_idx = i;
    }
  }
  return [
    nodes[lowest_idx].clone(),
    nodes[lowest_idx].position[0] + nogo.width * nodes[lowest_idx].position[1],
    lowest_idx,
  ];
}

function distance_between_nodes(
  start: [number, number],
  end: [number, number],
): number {
  const x = Math.abs(start[0] - end[0]);
  const z = Math.abs(start[1] - end[1]);
  if (x > z) {
    return 14 * z + 10 * (x - z);
  }
  return 14 * x + 10 * (z - x);
}

function set_node_params(
  start: LocalNode,
  end: LocalNode,
  node: LocalNode,
): LocalNode {
  const n = node.clone();
  n.g = distance_between_nodes(start.position, node.position);
  n.h = distance_between_nodes(node.position, end.position);
  return n;
}

function get_neighbor_nodes(
  start: LocalNode,
  end: LocalNode,
  neighbor_idx: number[],
  nodes: RustPathFindingNode[],
  nogo: RustNogo,
): LocalNode[] {
  const res: LocalNode[] = [];
  if (neighbor_idx[0] < 100000) {
    const node = nodes[neighbor_idx[0]];
    if (node.valid) {
      res.push(set_node_params(start, end, to_locale_node(node, nogo)));
    }
  }
  if (neighbor_idx[1] < 100000) {
    const node = nodes[neighbor_idx[1]];
    if (node.valid) {
      res.push(set_node_params(start, end, to_locale_node(node, nogo)));
    }
  }
  if (neighbor_idx[2] < 100000) {
    const node = nodes[neighbor_idx[2]];
    if (node.valid) {
      res.push(set_node_params(start, end, to_locale_node(node, nogo)));
    }
  }
  if (neighbor_idx[3] < 100000) {
    const node = nodes[neighbor_idx[3]];
    if (node.valid) {
      res.push(set_node_params(start, end, to_locale_node(node, nogo)));
    }
  }
  if (neighbor_idx[4] < 100000) {
    const node = nodes[neighbor_idx[4]];
    if (node.valid) {
      res.push(set_node_params(start, end, to_locale_node(node, nogo)));
    }
  }
  if (neighbor_idx[5] < 100000) {
    const node = nodes[neighbor_idx[5]];
    if (node.valid) {
      res.push(set_node_params(start, end, to_locale_node(node, nogo)));
    }
  }
  if (neighbor_idx[6] < 100000) {
    const node = nodes[neighbor_idx[6]];
    if (node.valid) {
      res.push(set_node_params(start, end, to_locale_node(node, nogo)));
    }
  }
  if (neighbor_idx[7] < 100000) {
    const node = nodes[neighbor_idx[7]];
    if (node.valid) {
      res.push(set_node_params(start, end, to_locale_node(node, nogo)));
    }
  }
  return res;
}

function is_in_set(node: LocalNode, nodes: LocalNode[]): boolean {
  for (let i = 0; i < nodes.length; i++) {
    if (
      nodes[i].position[0] === node.position[0] &&
      nodes[i].position[1] === node.position[1]
    ) {
      return true;
    }
  }
  return false;
}

function set_node_color(color: number, node: LocalNode) {
  (node.plane.material as MeshBasicMaterial).color.setHex(color);
}

async function delay(t: number) {
  await new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, t);
  });
}

function get_node_at_position(
  position: [number, number],
  nodes: LocalNode[],
): LocalNode | null {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (position[0] === node.position[0] && position[1] === node.position[1]) {
      return node;
    }
  }
  return null;
}

function resolve_path(
  start_node: LocalNode,
  end_node: LocalNode,
  nogo: RustNogo,
  closed_set: LocalNode[],
) {
  let current_node = start_node.clone();
  let do_loop = true;
  while (do_loop) {
    set_node_color(0x00ffff, current_node);
    if (
      current_node.position[0] === end_node.position[0] &&
      current_node.position[1] === end_node.position[1]
    ) {
      do_loop = false;
    } else {
      if (current_node.parent_idx) {
        const node = get_node_at_position(
          nogo.nodes[current_node.parent_idx].position,
          closed_set,
        );
        if (node) {
          current_node = node;
        } else {
          do_loop = false;
        }
      } else {
        do_loop = false;
      }
    }
  }
}

export class PathFinding {
  static async a_star(
    game: Game,
    start_node_opt: RustPathFindingNode,
    end_node_opt: RustPathFindingNode,
    nogo: RustNogo,
  ) {
    const start_node = to_locale_node(start_node_opt, nogo);
    set_node_color(0x00ff00, start_node);
    game.scene.add(start_node.plane);
    const end_node = to_locale_node(end_node_opt, nogo);
    set_node_color(0xff0000, end_node);
    game.scene.add(end_node.plane);
    const open_set: LocalNode[] = [start_node.clone()];
    const closed_set: LocalNode[] = [];
    while (open_set.length > 0) {
      const current_node = lowest_f(open_set, nogo);
      set_node_color(0xff00ff, current_node[0]);
      open_set.splice(current_node[2], 1);
      closed_set.push(current_node[0].clone());
      if (
        current_node[0].position[0] === end_node.position[0] &&
        current_node[0].position[1] === end_node.position[1]
      ) {
        resolve_path(current_node[0], start_node, nogo, closed_set);
        console.log('RESOLVED');
        return;
      }
      const neighbor_nodes = get_neighbor_nodes(
        start_node,
        end_node,
        current_node[0].neighbor_idx,
        nogo.nodes,
        nogo,
      );
      for (let i = 0; i < neighbor_nodes.length; i++) {
        neighbor_nodes[i].parent_idx = current_node[1];
        if (is_in_set(neighbor_nodes[i], closed_set) === false) {
          const new_move_cost =
            current_node[0].g +
            distance_between_nodes(
              current_node[0].position,
              neighbor_nodes[i].position,
            );
          if (
            new_move_cost < neighbor_nodes[i].g ||
            is_in_set(neighbor_nodes[i], open_set) === false
          ) {
            neighbor_nodes[i].g = new_move_cost;
            neighbor_nodes[i].h = distance_between_nodes(
              neighbor_nodes[i].position,
              end_node.position,
            );
            if (is_in_set(neighbor_nodes[i], open_set) === false) {
              set_node_color(0x0000ff, neighbor_nodes[i]);
              game.scene.add(neighbor_nodes[i].plane);
              open_set.push(neighbor_nodes[i].clone());
            }
          }
        }
      }
      await delay(100);
    }
    console.log('NO PATH');
  }
}
