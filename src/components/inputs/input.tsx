import { defineComponent } from 'vue';
import { InputWrapper, InputWrapperProps } from './wrapper';

export const Input = defineComponent({
  props: {
    ...InputWrapperProps,
    type: {
      type: String,
      default: 'text',
    },
    value: String,
  },
  emits: {
    input: (_value: string, _event: Event) => {
      return true;
    },
  },
  setup(props, ctx) {
    return () => (
      <InputWrapper {...props}>
        <input
          value={props.value}
          type={props.type}
          onInput={(event) => {
            const el = event.target as HTMLInputElement;
            ctx.emit('input', el.value, event);
          }}
        />
      </InputWrapper>
    );
  },
});
