import { defineComponent } from '@vue/runtime-core';
import { RouterView } from 'vue-router';
import { Toast } from './components';

const component = defineComponent({
  setup() {
    return () => (
      <div class="main">
        <RouterView />
        <Toast />
      </div>
    );
  },
});
export default component;
