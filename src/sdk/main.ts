import { AccountHandler } from './handlers/account.ts';
import { GameMapHandler } from './handlers/game-map.ts';
import { GameHandler } from './handlers/game.ts';
import { HeroHandler } from './handlers/hero.ts';
import { PathFinderHandler } from './handlers/path-finder.ts';
import { SettingsHandler } from './handlers/settings.ts';

export class Sdk {
    account = new AccountHandler();
    settings = new SettingsHandler();
    gameMap = new GameMapHandler();
    game = new GameHandler();
    hero = new HeroHandler();
    pathFinder = new PathFinderHandler();
}

const sdk = new Sdk();

export function useSdk() {
    return sdk;
}
