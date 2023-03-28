import { defineComponent, ref } from 'vue';
import { DefaultComponentProps } from '../default-props';
import { Icon } from '../icon';
import { DefaultInputProps } from './default-props';
import { InputWrapper } from './_wrapper';

export const PasswordInput = defineComponent({
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
    const show = ref(false);
    return () => (
      <InputWrapper {...props}>
        <div class="input--password">
          <input
            type={show.value ? 'text' : 'password'}
            id={props.id || props.label}
            value={props.value}
            placeholder={props.placeholder}
            onInput={(event) => {
              const el = event.target as HTMLInputElement;
              ctx.emit('input', el.value);
            }}
          />
          <button
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              show.value = !show.value;
            }}
          >
            <Icon src="/eye" />
          </button>
        </div>
      </InputWrapper>
    );
  },
});
