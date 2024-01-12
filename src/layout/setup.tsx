import { defineComponent } from 'vue';

export const SetupLayout = defineComponent({
  setup(_, ctx) {
    return () => (
      <div class='min-w-screen min-h-screen flex flex-col items-center justify-center'>
        <div class="fixed w-full h-full">
          <img
            class="w-full h-full object-cover"
            src="/login-bg.png"
            alt="login background"
          />
        </div>
        <div class="z-10 relative bg-slate-900 bg-opacity-90 p-8">
          {ctx.slots.default ? ctx.slots.default() : ''}
        </div>
      </div>
    );
  },
});
