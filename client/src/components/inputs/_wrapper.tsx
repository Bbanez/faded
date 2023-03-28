import { defineComponent } from 'vue';
import { DefaultComponentProps } from '../default-props';
import { DefaultInputProps } from './default-props';

export const InputWrapper = defineComponent({
  props: {
    ...DefaultComponentProps,
    ...DefaultInputProps,
  },
  setup(props, ctx) {
    return () => (
      <div
        id={props.id}
        style={props.style}
        class={`input ${props.class || ''}`}
      >
        {props.label && (
          <label class="input--label" for={props.id || props.label}>
            {props.label}
          </label>
        )}
        {props.errorText && <div class="input--error">{props.errorText}</div>}
        <div class="input--inner">
          {ctx.slots.default ? ctx.slots.default() : ''}
        </div>
        {props.helperText && (
          <div class="input--helper">{props.helperText}</div>
        )}
      </div>
    );
  },
});
