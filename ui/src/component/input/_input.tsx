import { defineComponent } from 'vue';
import { DefaultComponentProps } from '../default-props';
import { DefaultInputComponentProps } from './default-props';

export const InputWrapper = defineComponent({
  props: {
    ...DefaultComponentProps,
    ...DefaultInputComponentProps,
  },
  emits: {
    click: () => {
      return true;
    },
  },
  setup(props, ctx) {
    return () => (
      <label
        class={`input ${props.invalidText ? 'input_invalid' : ''} ${
          props.class
        }`}
        onClick={() => {
          ctx.emit('click');
        }}
        for={props.id ? props.id : props.label}
      >
        {props.label && <div class={`input--label`}>{props.label}</div>}
        {props.invalidText ? (
          <div class="input--invalidText">{props.invalidText}</div>
        ) : (
          ''
        )}
        <div class="input--content">
          {ctx.slots.default ? ctx.slots.default() : ''}
        </div>
        {props.helperText && (
          <div class="input--helperText">{props.helperText}</div>
        )}
      </label>
    );
  },
});
