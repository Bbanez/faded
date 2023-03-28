import { defineComponent } from 'vue';

export const NormalLayout = defineComponent({
  setup(_, ctx) {
    return () => (
      <div class="normalLayout">
        <div class="normalLayout--body">
          {ctx.slots.default ? ctx.slots.default() : ''}
        </div>
        <div class="normalLayout--info">
          <img src="/login-bg.png" alt="Faded background" />
          <div class="normalLayout--info-wrapper">
            <h2>Welcome to Faded</h2>
          </div>
        </div>
      </div>
    );
  },
});
