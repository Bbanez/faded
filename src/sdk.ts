import type { Sdk } from './sdk/main';

let sdk: Sdk | null;

export function useSdk(): Sdk {
  return sdk as Sdk;
}

export function initSdk(SDK: Sdk) {
  sdk = SDK;
}
