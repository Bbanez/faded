import type { RustPathFindingNode } from "./path_finding";

export interface RustNogo {
  nodes: RustPathFindingNode[];
  width: number;
  height: number;
  map_width: number;
  map_height: number;
  map_node_height: number;
  map_node_width: number;
}