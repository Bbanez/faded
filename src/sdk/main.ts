import { AccountHandler } from './handlers/account.ts';
import { CharacterHandler } from './handlers/character.ts';
import { GameMapHandler } from './handlers/game-map.ts';
import { SettingsHandler } from './handlers/settings.ts';

export class Sdk {
    account = new AccountHandler();
    // player = new PlayerHandler(this);
    // manager = new ManagerHandler();
    // data = new DataHandler();
    settings = new SettingsHandler();
    gameMap = new GameMapHandler();
    // landscape = new LandscapeHandler();
    character = new CharacterHandler();
}

const sdk = new Sdk();

export function useSdk() {
    return sdk;
}
