export type ToastType = 'info' | 'warning' | 'error';

export class ToastService {
  static emit(_type: ToastType, _message: string | JSX.Element): void {
    throw Error('Not implemented');
  }
}
