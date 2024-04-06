import { v4 as uuidv4 } from 'uuid';
import type { JSX } from 'vue/jsx-runtime';

export type NotificationMessageType = 'error' | 'info' | 'success' | 'warn';

export type NotificationMessageContent = string | JSX.Element;

export interface NotificationMessageHandler {
    (type: NotificationMessageType, content: NotificationMessageContent): void;
}

interface NotifictionSub {
    id: string;
    on_message: NotificationMessageHandler;
}

export class NotificationService {
    private static subs: NotifictionSub[] = [];

    static push(
        type: NotificationMessageType,
        content: NotificationMessageContent,
    ) {
        for (let i = 0; i < this.subs.length; i++) {
            try {
                this.subs[i].on_message(type, content);
            } catch (err) {
                console.error(err);
            }
        }
    }

    static on_message(handler: NotificationMessageHandler): () => void {
        const id = uuidv4();
        this.subs.push({ id, on_message: handler });
        return () => {
            for (let i = 0; i < this.subs.length; i++) {
                if (this.subs[i].id === id) {
                    this.subs.splice(i, 1);
                    break;
                }
            }
        };
    }
}
