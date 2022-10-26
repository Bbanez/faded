import { defineComponent, ref } from 'vue';
import { ToastService } from '../services';

export type ToastMessageType = 'success' | 'error' | 'info' | 'warn';

export interface ToastMessage {
  type: ToastMessageType;
  content: string;
}

export const Toast = defineComponent({
  setup() {
    const messages = ref<ToastMessage[]>([]);

    ToastService.onMessage = (message) => {
      messages.value.push(message);
    };

    return () => (
      <>
        {messages.value.length > 0 && (
          <div class="toast">
            {messages.value.map((message, messageIdx) => {
              return (
                <div class={`toast--message toast--message_${message.type}`}>
                  <div class="toast--content" v-html={message.content} />
                  <button
                    class="toast--message-close"
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
        )}
      </>
    );
  },
});
