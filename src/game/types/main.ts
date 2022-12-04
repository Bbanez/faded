import type { Svemir, SvemirConfig } from 'svemir/types';
import type { GameCharScreen } from '../views/char-screen';

export type GameConfig = SvemirConfig;

export interface Game {
  s: Svemir;
  views: {
    charSelection: GameCharScreen;
  };
  destroy(): Promise<void>;
}
