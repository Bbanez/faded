import { defineComponent, PropType } from 'vue';
import { InputWrapper, InputWrapperProps } from './wrapper';

export function inputAsNumber(
  type: 'int' | 'float',
): (value: string) => string {
  return (value) => {
    console.log('a');
    if (value) {
      value = value.replace(/[^0-9.]/g, '');
      if (!value.endsWith('.')) {
        const num = type === 'int' ? parseInt(value) : parseFloat(value);
        if (isNaN(num)) {
          value = '';
        } else {
          value = '' + num;
        }
      }
    }
    return value;
  };
}

export const Input = defineComponent({
  props: {
    ...InputWrapperProps,
    type: {
      type: String,
      default: 'text',
    },
    format: Function as PropType<(value: string, event: Event) => string>,
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
            if (props.format) {
              el.value = props.format(el.value, event);
            }
            ctx.emit('input', el.value, event);
          }}
        />
      </InputWrapper>
    );
  },
});
