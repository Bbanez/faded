import { v4 as uuidv4 } from 'uuid';
import { type NotificationMessageType, NotificationService } from '@ui/service';
import { defineComponent, onUnmounted, ref } from 'vue';

interface Message {
  id: string;
  type: NotificationMessageType;
  content: string | JSX.Element;
}

export const Toast = defineComponent({
  setup() {
    const timeout = 8000;
    const messages = ref<Message[]>([]);
    const unreg = NotificationService.register((type, content) => {
      if (messages.value.find((e) => e.content === content)) {
        return;
      }
      const id = uuidv4();
      messages.value = [
        {
          id,
          type,
          content,
        },
        ...messages.value,
      ];
      setTimeout(() => {
        messages.value = messages.value.filter((e) => e.id !== id);
      }, timeout);
    });

    onUnmounted(() => {
      unreg();
    });

    return () => (
      <div class="toast">
        <div class="toast--messages">
          {messages.value.map((message) => {
            return (
              <div class={`toast--message toast--message_${message.type}`}>
                <div class="toast--message-header">
                  <div class="toast--message-label">{message.type}</div>
                  <button
                    onClick={() => {
                      messages.value = messages.value.filter(
                        (e) => e.id !== message.id,
                      );
                    }}
                  >
                    X
                  </button>
                </div>
                <div class="toast--message-content">{message.content}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
});
