import { defineComponent } from 'vue';
import { RouterView } from 'vue-router';
import { AssetLeader, ModalConfirm, ModalUserSearch, Toast } from './component';

export const App = defineComponent({
  setup() {
    return () => (
      <div>
        <RouterView />

        <Toast />
        <ModalConfirm />
        <ModalUserSearch />
        <AssetLeader />
      </div>
    );
  },
});
