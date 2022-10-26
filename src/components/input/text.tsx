import { defineComponent } from 'vue';
import { DefaultComponentProps } from '../default-props';
import { DefaultInputProps } from './default-props';
import { InputWrapper } from './_wrapper';

export const TextInput = defineComponent({
  props: {
    ...DefaultComponentProps,
    ...DefaultInputProps,
    value: String,
    modelValue: String,
    type: {
      type: String,
      default: 'text',
    },
    disabled: Boolean,
    placeholder: String,
  },
  emits: {
    input: (_value: string) => true,
    'update:modelValue': (_value: string) => true,
    enter: (_value: string) => true,
  },
  setup(props, ctx) {
    function inputHandler(event: Event) {
      const element = event.target as HTMLInputElement;
      if (!element) {
        return;
      }
      ctx.emit('update:modelValue', element.value);
      ctx.emit('input', element.value);
    }

    return () => (
      <InputWrapper
        id={props.id}
        class={props.class}
        label={props.label}
        helper={props.helper}
        error={props.error}
      >
        <input
          type={props.type}
          id={props.id ? props.id : props.label}
          class="input--text"
          placeholder={props.placeholder}
          value={props.value ? props.value : props.modelValue}
          disabled={props.disabled}
          onChange={inputHandler}
          onKeyup={(event) => {
            inputHandler(event);
            if (event.key === 'Enter') {
              const el = event.target as HTMLInputElement;
              ctx.emit('enter', el.value);
            }
          }}
        />
      </InputWrapper>
    );
  },
});
