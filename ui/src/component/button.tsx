import { defineComponent, type PropType } from 'vue';
import { DefaultComponentProps } from './default-props';

export const Button = defineComponent({
  props: {
    ...DefaultComponentProps,
    kind: {
      type: String as PropType<'primary' | 'secondary' | 'ghost' | 'danger'>,
      default: 'primary',
    },
    disabled: Boolean,
  },
  emits: {
    click: () => {
      return true;
    },
  },
  setup(props, ctx) {
    return () => (
      <button
        id={props.id}
        style={props.style}
        class={`button button_${props.kind} ${props.class || ''}`}
        disabled={props.disabled}
        onClick={() => {
          ctx.emit('click');
        }}
      >
        <div class="button--inner">
          {ctx.slots.default ? ctx.slots.default() : ''}
        </div>
      </button>
    );
  },
});
