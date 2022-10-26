import { defineComponent, ref } from 'vue';
import { DefaultComponentProps } from '../default-props';
import { DefaultInputProps } from './default-props';
import { InputWrapper } from './_wrapper';

export const PasswordInput = defineComponent({
  props: {
    ...DefaultComponentProps,
    ...DefaultInputProps,
    value: String,
    modelValue: String,
    disabled: Boolean,
    placeholder: String,
  },
  emits: {
    input: (_value: string) => true,
    'update:modelValue': (_value: string) => true,
    enter: (_value: string) => true,
  },
  setup(props, ctx) {
    const type = ref('password');
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
        <div class="input--password">
          <input
            class="input--error-area"
            type={type.value}
            id={props.id ? props.id : props.label}
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
          <div class="input--error-toggle">
            <button
              onClick={() => {
                type.value = type.value === 'password' ? 'text' : 'password';
              }}
            >
              T
            </button>
          </div>
        </div>
      </InputWrapper>
    );
  },
});
