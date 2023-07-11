import { ModalService } from '@ui/service';
import { defineComponent, PropType, ref } from 'vue';
import { Button } from '../button';
import { DefaultComponentProps } from '../default-props';

export interface ModalDone {
  (event?: Event): void;
}

export interface ModalCancel {
  (event?: Event): void;
}

export function createModalDoneFn(cb: ModalDone) {
  return cb;
}

export function createModalCancelFn(cb: ModalDone) {
  return cb;
}

export const Modal = defineComponent({
  props: {
    ...DefaultComponentProps,
    modalName: { type: String as PropType<keyof ModalService>, required: true },
    title: String,
    description: String,
    header: Object as PropType<JSX.Element>,
    footer: Object as PropType<JSX.Element>,
    doneText: String,
    cancelText: String,
    triggerCancel: Function as PropType<
      (callback: (event?: Event) => void) => void
    >,
    triggerDone: Function as PropType<
      (callback: (event: Event) => void) => void
    >,
  },
  emits: {
    show: (_data: any) => {
      return true;
    },
    cancel: (_event?: Event) => {
      return true;
    },
    done: (_event?: Event) => {
      return true;
    },
  },
  setup(props, ctx) {
    const show = ref(false);

    ModalService[props.modalName].hide = () => {
      show.value = false;
      ctx.emit('cancel');
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ModalService[props.modalName].show = (data: any) => {
      ModalService[props.modalName].onShow(data);
      ctx.emit('show', data);
      show.value = true;
    };

    async function cancel(event?: Event) {
      ctx.emit('cancel', event);
      show.value = false;
    }

    async function done(event?: Event) {
      if (props.onDone) {
        if (await props.onDone(event)) {
          show.value = false;
        }
      } else {
        show.value = false;
      }
    }

    return () => (
      <>
        {show.value ? (
          <div
            data-modal
            class={`modal ${props.class || ''}`}
            onClick={(event) => {
              const el = event.target as HTMLElement;
              const result = el.getAttribute('data-modal');
              if (result) {
                cancel();
              }
            }}
          >
            <div class="modal--wrapper">
              {props.title || props.header ? (
                <div class="modal--header">
                  <h3 class="modal--header-title">
                    {props.header
                      ? props.header
                      : props.title
                      ? props.title
                      : ''}
                  </h3>
                  {props.description && (
                    <p class="modal--header-description">{props.description}</p>
                  )}
                </div>
              ) : (
                ''
              )}
              <div class="modal--body">
                {ctx.slots.default ? ctx.slots.default() : ''}
              </div>
              <div class="modal--footer">
                {props.footer ? (
                  props.footer
                ) : (
                  <>
                    <Button kind="ghost" onClick={cancel}>
                      {props.cancelText || 'Cancel'}
                    </Button>
                    <Button onClick={done}>{props.doneText || 'Done'}</Button>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          ''
        )}
      </>
    );
  },
});
