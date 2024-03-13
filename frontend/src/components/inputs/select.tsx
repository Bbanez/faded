import { defineComponent, PropType } from 'vue';
import { InputWrapper, InputWrapperProps } from './wrapper';

export interface SelectOption {
  label: string;
  value: string;
}

export const Select = defineComponent({
  props: {
    ...InputWrapperProps,
    value: String,
    options: {
      type: Array as PropType<SelectOption[]>,
      required: true,
    },
  },
  emits: {
    input: (_option: SelectOption, _event: Event) => {
      return true;
    },
  },
  setup(props, ctx) {
    return () => (
      <InputWrapper {...props}>
        <select
          onChange={(event) => {
            const el = event.target as HTMLSelectElement;
            const option = props.options.find((e) => e.value === el.value);
            if (option) {
              ctx.emit('input', option, event);
            }
          }}
        >
          {props.options.map((option) => {
            return (
              <option
                value={option.value}
                selected={option.value === props.value}
              >
                {option.label}
              </option>
            );
          })}
        </select>
      </InputWrapper>
    );
  },
});
