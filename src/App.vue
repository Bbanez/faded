<style>
@import './assets/styles/main.scss';
</style>

<script lang="tsx">
import { defineComponent } from 'vue';
import { RouterView } from 'vue-router';

const component = defineComponent({
  setup() {
    return () => (
      <div class="container">
        <RouterView />
      </div>
    );
  },
});
export default component;
</script>
