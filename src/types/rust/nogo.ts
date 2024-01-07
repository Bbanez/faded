import { Linear2DFn } from '../../game/math';
import type { RustPathFindingNode } from './path_finding';

export interface RustNogo {
  nodes: RustPathFindingNode[];
  width: number;
  height: number;
  map_width: number;
  map_height: number;
  map_node_height: number;
  map_node_width: number;
}

export interface Nogo extends RustNogo {
  map_x_trans: Linear2DFn;
  map_z_trans: Linear2DFn;
}
