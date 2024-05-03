import { AccountHandler } from './handlers/account.ts';
import { PlayerHandler } from './handlers/player.ts';
import { ManagerHandler } from './handlers/manager.ts';
import { DataHandler } from './handlers/data.ts';
import { SettingsHandler } from './handlers/settings.ts';

export class Sdk {
    account = new AccountHandler();
    player = new PlayerHandler(this);
    manager = new ManagerHandler();
    data = new DataHandler();
    settings = new SettingsHandler();
}

const sdk = new Sdk();

export function useSdk() {
    return sdk;
}
