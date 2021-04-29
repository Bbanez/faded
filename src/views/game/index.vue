<script lang="tsx">
import { defineComponent, onMounted } from 'vue';
import { three } from '../../game';

const component = defineComponent({
  setup() {
    onMounted(() => {
      three.init().catch((error) => {
        console.error(error);
      });
    });
    return () => (
      <div class="home">
        <div id="faded-game" />
      </div>
    );
  },
});
export default component;
</script>
