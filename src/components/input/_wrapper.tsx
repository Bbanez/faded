import { defineComponent, PropType, Ref } from 'vue';
import { DefaultComponentProps } from '../default-props';
import { DefaultInputProps } from './default-props';

export const InputWrapper = defineComponent({
  props: {
    ...DefaultComponentProps,
    ...DefaultInputProps,
    containerRef: Object as PropType<Ref<HTMLElement>>,
  },
  emits: {
    click: () => {
      return true;
    },
  },
  setup(props, ctx) {
    return () => (
      <label
        class={`input ${props.error ? 'input--error' : ''}`}
        onClick={() => {
          ctx.emit('click');
        }}
        for={props.id ? props.id : props.label}
        ref={props.containerRef}
      >
        {props.label ? <span class="input--label">{props.label}</span> : ''}
        {props.error ? <div class="input--errorMessage">{props.error}</div> : ''}
        <div class={`input--content`}>
          {ctx.slots.default ? ctx.slots.default() : ''}
        </div>
        {props.helper ? (
          <div class="input--helper" v-html={props.helper} />
        ) : (
          ''
        )}
      </label>
    );
  },
});
