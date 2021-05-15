<script lang="tsx">
import { defineComponent, onMounted, ref } from 'vue';
import { three } from '../../game';

const component = defineComponent({
  setup() {
    const gameArea = ref<HTMLDivElement | null>(null);
    onMounted(() => {
      if (!gameArea.value) {
        // TODO: handle
        return;
      }
      three.init(gameArea.value).catch((error) => {
        console.error(error);
      });
    });
    return () => (
      <div class="home">
        <div ref={gameArea} />
      </div>
    );
  },
});
export default component;
</script>
