import { defineComponent, type PropType } from 'vue';
import { DefaultComponentProps } from './default-props';

export const Button = defineComponent({
  props: {
    ...DefaultComponentProps,
    kind: {
      type: String as PropType<
        'primary' | 'secondary' | 'alternate' | 'ghost' | 'danger'
      >,
      default: 'primary',
    },
    disabled: Boolean,
  },
  emits: {
    click: (_: MouseEvent) => {
      return true;
    },
  },
  setup(props, ctx) {
    return () => (
      <button
        class={`btn btn_${props.kind} ${props.class || ''}`}
        style={props.style}
        disabled={props.disabled}
        onClick={(event) => {
          ctx.emit('click', event);
        }}
      >
        {ctx.slots.default ? (
          <span class="btn--inner">{ctx.slots.default()}</span>
        ) : (
          ''
        )}
      </button>
    );
  },
});
