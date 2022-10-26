import type { ToastMessage } from '../components';

export class ToastService {
  static onMessage(_message: ToastMessage): void {
    // Do nothing. Logic in Toast component
  }

  static emit(message: ToastMessage) {
    ToastService.onMessage(message);
  }
}
