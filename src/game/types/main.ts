import type { Svemir, SvemirConfig } from "svemir/types";

export type GameConfig = SvemirConfig;

export interface Game {
  s: Svemir;
  destroy(): Promise<void>;
}
