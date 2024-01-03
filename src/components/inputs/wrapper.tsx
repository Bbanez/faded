import { PropType, defineComponent } from 'vue';
import { DefaultComponentProps } from '../_default';
import { AlertCircleIcon } from '../icons';
import { JSX } from 'vue/jsx-runtime';

export const InputWrapperProps = {
  ...DefaultComponentProps,
  label: String,
  helperText: Object as PropType<string | JSX.Element>,
  error: Object as PropType<string | JSX.Element>,
};

export const InputWrapper = defineComponent({
  props: {
    ...InputWrapperProps,
  },
  setup(props, ctx) {
    return () => (
      <div class="flex flex-col">
        {props.label || props.error ? (
          <div
            class={`flex gap-2 items-center mb-1 ${
              props.error ? 'text-red-500' : ''
            }`}
          >
            {props.label && <div class="uppercase text-xs">{props.label}</div>}
            {props.error && (
              <div>
                <AlertCircleIcon class="w-4 h-4" />
              </div>
            )}
          </div>
        ) : (
          ''
        )}
        <div class="text-black">
          {ctx.slots.default ? ctx.slots.default() : ''}
        </div>
        {props.helperText && (
          <div class="text-xs text-gray-500 font-light mt-1">
            {props.helperText}
          </div>
        )}
      </div>
    );
  },
});
