import { PropType, defineComponent } from 'vue';
import { DefaultComponentProps } from './_default';

export type ButtonType = 'primary';

export const Button = defineComponent({
  props: {
    ...DefaultComponentProps,
    kind: {
      type: String as PropType<ButtonType>,
      default: 'primary',
    },
  },
  emits: {
    click: (_event: Event) => {
      return true;
    },
  },
  setup(props, ctx) {
    return () => (
      <button
        id={props.id}
        class={`${props.kind === 'primary' ? '' : ''} ${props.class || ''}`}
        style={props.style}
        onClick={(event) => {
          ctx.emit('click', event);
        }}
      >
        {ctx.slots.default ? ctx.slots.default() : ''}
      </button>
    );
  },
});
