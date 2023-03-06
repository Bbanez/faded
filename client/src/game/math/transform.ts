import { Map } from '../map';
import type { Player } from '../player';

export function screenToWorldSpace(
  x: number,
  y: number,
  player: Player,
): [number, number] {
  const r1x = player.position[0] - window.innerWidth / 2;
  const r1y = player.position[1] - window.innerHeight / 2;
  const x2 = r1x + x;
  const y2 = r1y + y;
  return [x2, y2];
}

export function worldToScreenSpace(
  x: number,
  y: number,
  player: Player,
): [number, number] {
  const r1x = player.position[0] - window.innerWidth / 2;
  const r1y = player.position[1] - window.innerHeight / 2;
  return [x - r1x, y - r1y];
}

export function worldPositionToChunk(x: number, y: number): [number, number] {
  return [parseInt(`${Map.chunkFn(x)}`), parseInt(`${Map.chunkFn(y)}`)];
}

export function isVisible(x: number, y: number, player: Player): boolean {
  const screenPos = worldToScreenSpace(x, y, player);
  return (
    screenPos[0] >= 0 &&
    screenPos[0] <= window.innerWidth &&
    screenPos[1] >= 0 &&
    screenPos[1] <= window.innerHeight
  );
}
