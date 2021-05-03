<script lang="tsx">
import { defineComponent } from 'vue';
import { RouterView } from 'vue-router';
import { AssetLoader } from './components';

const component = defineComponent({
  setup() {
    return () => (
      <div class="container">
        <RouterView />
        <AssetLoader />
      </div>
    );
  },
});
export default component;
</script>
