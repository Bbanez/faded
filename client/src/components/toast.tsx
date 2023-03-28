import { ToastService, type ToastType } from '@client/services';
import { v4 as uuidv4 } from 'uuid';
import { defineComponent, ref } from 'vue';

export const Toast = defineComponent({
  setup() {
    const messages = ref<
      Array<{ id: string; type: ToastType; message: string | JSX.Element }>
    >([]);

    ToastService.emit = (type, message) => {
      const id = uuidv4();
      messages.value = [
        {
          id,
          type,
          message,
        },
        ...messages.value,
      ];
      if (type !== 'error') {
        setTimeout(() => {
          messages.value = messages.value.filter((e) => e.id !== id);
        }, 8000);
      }
    };

    return () => (
      <div
        class="toast"
        style={`display: ${messages.value.length > 0 ? 'block' : 'none'};`}
      >
        <div class="toast--wrapper">
          {messages.value.map((item) => {
            return (
              <div class={`toast--item toast--item_${item.type}`}>
                <div class="toast--item-header">
                  <div>{item.type}</div>
                  <button
                    onClick={() => {
                      messages.value = messages.value.filter(
                        (e) => e.id !== item.id,
                      );
                    }}
                  >
                    X
                  </button>
                </div>
                <div class="toast--item-content">{item.message}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
});
