export interface RustPathFindingNode {
  g: number;
  h: number;
  position: [number, number];
  map_position: [number, number];
  parent_idx: number | null;
  neighbor_idx: number[];
  valid: boolean;
}
