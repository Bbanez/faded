import { defineComponent } from 'vue';

export const AuthLayout = defineComponent({
  props: {
    title: String,
  },
  setup(props, ctx) {
    return () => (
      <div class="authLayout">
        <img
          class="authLayout--bg"
          src="/assets/login-bg.png"
          alt="Faded sphere"
          draggable={false}
        />
        <div class="authLayout--content">
          {props.title && <h1 class="authLayout--title">{props.title}</h1>}
          {ctx.slots.default ? ctx.slots.default() : ''}
        </div>
      </div>
    );
  },
});
