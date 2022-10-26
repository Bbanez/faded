import { ToastService } from '../services';

export async function throwable<
  ThrowableResult,
  OnSuccessResult,
  OnErrorResult,
>(
  throwableFn: () => Promise<ThrowableResult>,
  onSuccess?: (data: ThrowableResult) => Promise<OnSuccessResult>,
  onError?: (error: unknown) => Promise<OnErrorResult>,
): Promise<OnSuccessResult | OnErrorResult> {
  let output: ThrowableResult;
  try {
    output = await throwableFn();
  } catch (e) {
    if (onError) {
      return await onError(e);
    } else {
      // eslint-disable-next-line no-console
      console.error(e);
      const err = e as {
        status: number;
        code: string;
        message: string;
      };
      if (err.code && err.message) {
        ToastService.emit({
          type: 'error',
          content: err.message,
        });
      }
      return e as OnErrorResult;
    }
  }
  if (onSuccess) {
    return await onSuccess(output);
  }
  return undefined as never;
}
