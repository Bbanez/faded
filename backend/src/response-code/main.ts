import type { GeneralCodes } from './codes/general';
import { UserCodes } from './codes/user';

type Keys = keyof typeof UserCodes | keyof typeof GeneralCodes;
type FnsParams = typeof UserCodes & typeof GeneralCodes;

const Codes = {
  ...UserCodes,
};

export function responseCode<
  T extends Keys,
  K extends Parameters<FnsParams[T]>,
>(key: T, ...params: K) {
  return {
    code: key,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    message: (Codes[key as never] as any)(...params),
  };
}
