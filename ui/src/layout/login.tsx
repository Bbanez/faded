import { DefaultComponentProps } from '@ui/component';
import { defineComponent, PropType } from 'vue';

export const LoginLayout = defineComponent({
  props: {
    ...DefaultComponentProps,
    title: {
      type: String,
      required: true,
    },
    content: Object as PropType<JSX.Element>,
  },
  setup(props, ctx) {
    return () => (
      <div
        id={props.id}
        style={props.style}
        class={`lLayout ${props.class || ''}`}
      >
        <div class="lLayout--left">
          <div class="lLayout--left-wrapper">
            <h1>{props.title}</h1>
            <div class="lLayout--left-content">
              {ctx.slots.default ? ctx.slots.default() : ''}
            </div>
          </div>
        </div>
        <div class="lLayout--right">
          <img
            class="lLayout--right-img"
            src="/ui/login-bg.png"
            alt="Background"
          />
          <div class="lLayout--right-content">
            {props.content ? props.content : <h2>Faded</h2>}
          </div>
        </div>
      </div>
    );
  },
});
