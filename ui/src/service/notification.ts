import * as uuid from 'uuid';

export type NotificationMessageType = 'info' | 'error' | 'success' | 'warning';

export class NotificationService {
  private static handlers: Array<{
    id: string;
    handler(type: NotificationMessageType, content: string | JSX.Element): void;
  }> = [];

  static register(
    handler: (type: NotificationMessageType, content: string) => void,
  ): () => void {
    const id = uuid.v4();
    NotificationService.handlers.push({ id, handler });
    return () => {
      for (let i = 0; i < NotificationService.handlers.length; i++) {
        if (NotificationService.handlers[i].id === id) {
          NotificationService.handlers.splice(i, 1);
          break;
        }
      }
    };
  }

  static info(content: string): void {
    NotificationService.handlers.forEach((e) => {
      e.handler('info', content);
    });
  }

  static warning(content: string): void {
    NotificationService.handlers.forEach((e) => {
      e.handler('warning', content);
    });
  }

  static success(content: string): void {
    NotificationService.handlers.forEach((e) => {
      e.handler('success', content);
    });
  }

  static error(content: string): void {
    NotificationService.handlers.forEach((e) => {
      e.handler('error', content);
    });
  }

  static push(type: NotificationMessageType, content: string): void {
    NotificationService.handlers.forEach((e) => {
      e.handler(type, content);
    });
  }
}
