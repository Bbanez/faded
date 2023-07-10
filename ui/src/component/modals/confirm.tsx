import { ModalInputDefaults, ModalService } from '@ui/service';
import { defineComponent, ref } from 'vue';
import { createModalCancelFn, createModalDoneFn, Modal } from './_wrapper';

let done = createModalDoneFn(() => {
  // Do nothing
});
let cancel = createModalCancelFn(() => {
  // Do nothing
});

export const ModalConfirm = defineComponent({
  setup() {
    const data = ref<
      { message: string | JSX.Element } & ModalInputDefaults<boolean>
    >({
      title: 'Confirm',
      message: '',
    });

    ModalService.confirm.onShow = (event) => {
      done = () => {
        if (event.onDone) {
          event.onDone(true);
        }
      };
      cancel = () => {
        if (event.onDone) {
          event.onDone(false);
        }
      };
      data.value = event;
    };

    return () => (
      <Modal
        modalName="confirm"
        title={data.value.title || 'Confirm'}
        onDone={() => {
          if (done) {
            done();
            return true;
          }
          return false;
        }}
        onCancel={() => {
          if (cancel) {
            cancel();
          }
        }}
        doneText="Confirm"
      >
        <div class="confirm--message">{data.value.message}</div>
      </Modal>
    );
  },
});
