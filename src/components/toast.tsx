import { v4 as uuidv4 } from 'uuid';
import { defineComponent, ref } from 'vue';
import {
    NotificationMessageContent,
    NotificationMessageType,
    NotificationService,
} from '../services/notification.ts';

interface Message {
    id: string;
    type: NotificationMessageType;
    content: NotificationMessageContent;
    colorClass: string;
}

export const Toast = defineComponent({
    setup() {
        const messages = ref<Message[]>([]);

        NotificationService.on_message((type, content) => {
            const id = uuidv4();
            const message: Message = {
                id,
                type,
                content,
                colorClass: '',
            };
            switch (type) {
                case 'error':
                    {
                        message.colorClass = 'bg-red-600 text-white';
                    }
                    break;
                case 'warn':
                    {
                        message.colorClass = 'bg-amber-400 text-black';
                    }
                    break;
                case 'success':
                    {
                        message.colorClass = 'bg-emerald-600 text-white';
                    }
                    break;
                case 'info':
                    {
                        message.colorClass = 'bg-gray-600 text-white';
                    }
                    break;
            }
            messages.value.push(message);
            if (type !== 'error') {
                setTimeout(() => {
                    for (let i = 0; i < messages.value.length; i++) {
                        if (messages.value[i].id === id) {
                            messages.value.splice(i, 1);
                        }
                    }
                }, 8000);
            }
        });

        return () => (
            <div class={`fixed bottom-0 right-0 w-[300px] max-h-screen z-10 flex flex-col gap-2 p-2`}>
                {messages.value.map((message, messageIdx) => {
                    return (
                        <div
                            class={`flex text-xs w-full shadow-2xl font-light ${message.colorClass}`}
                        >
                            <div class={`text-left p-2`}>{message.content}</div>
                            <button
                                class={`ml-auto p-2`}
                                onClick={() => {
                                    messages.value.splice(messageIdx, 1);
                                }}
                            >
                                X
                            </button>
                        </div>
                    );
                })}
            </div>
        );
    },
});
