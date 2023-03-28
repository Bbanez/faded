import { defineComponent } from 'vue';
import { RouterView } from 'vue-router';
import { Toast } from './components';

export default defineComponent({
  setup() {
    return () => (
      <div class="main">
        <RouterView />

        <Toast />
      </div>
    );
  },
});
