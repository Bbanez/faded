import { defineComponent } from 'vue';
import { DefaultComponentProps } from '../default-props';
import { DefaultInputComponentProps } from './default-props';
import { InputWrapper } from './_input';

export const TextInput = defineComponent({
  props: {
    ...DefaultComponentProps,
    ...DefaultInputComponentProps,
    value: String,
    disabled: Boolean,
    type: {
      type: String,
      default: 'text',
    },
    placeholder: String,
  },
  emits: {
    enter: () => {
      return true;
    },
    input: (_value: string, _event: Event) => {
      return true;
    },
  },
  setup(props, ctx) {
    function inputHandler(event: Event) {
      const el = event.target as HTMLInputElement;
      ctx.emit('input', el.value, event);
    }

    return () => (
      <InputWrapper
        id={props.id}
        class={`input--text ${props.class}`}
        style={props.style}
        helperText={props.helperText}
        invalidText={props.invalidText || props.invalidText}
        label={props.label}
      >
        <input
          id={props.id || props.label}
          type={props.type}
          placeholder={props.placeholder}
          onChange={inputHandler}
          onInput={inputHandler}
          value={props.value}
        />
      </InputWrapper>
    );
  },
});
