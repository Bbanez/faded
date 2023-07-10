import { defineComponent } from 'vue';
import { RouterView } from 'vue-router';
import { ModalConfirm, ModalUserSearch, Toast } from './component';

export const App = defineComponent({
  setup() {
    return () => (
      <div>
        <RouterView />

        <Toast />
        <ModalConfirm />
        <ModalUserSearch />
      </div>
    );
  },
});
