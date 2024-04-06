import { AccountHandler } from './handlers/account.ts';

export class Sdk {
    account = new AccountHandler();
}

const sdk = new Sdk();

export function useSdk() {
    return sdk;
}
