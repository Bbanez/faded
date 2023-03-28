import { defineComponent } from 'vue';
import { DefaultComponentProps } from '../default-props';
import { DefaultInputProps } from './default-props';
import { InputWrapper } from './_wrapper';

export const TextInput = defineComponent({
  props: {
    ...DefaultComponentProps,
    ...DefaultInputProps,
    value: String,
  },
  emits: {
    input: (_value: string) => {
      return true;
    },
  },
  setup(props, ctx) {
    return () => (
      <InputWrapper {...props}>
        <div class="input--text">
          <input
            id={props.id || props.label}
            value={props.value}
            placeholder={props.placeholder}
            onInput={(event) => {
              const el = event.target as HTMLInputElement;
              ctx.emit('input', el.value);
            }}
          />
        </div>
      </InputWrapper>
    );
  },
});
