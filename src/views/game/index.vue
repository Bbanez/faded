<script lang="tsx">
import { defineComponent, onMounted, ref } from 'vue';
import { createGame } from '../../game';
import type { Game } from '../../game/types';

const component = defineComponent({
  setup() {
    const gameArea = ref<HTMLDivElement | null>(null);
    const game = ref<Game>();
    onMounted(() => {
      if (!gameArea.value) {
        // TODO: handle
        return;
      }
      createGame({
        htmlElement: gameArea.value,
      })
        .then((result) => {
          game.value = result;
        })
        .catch((error) => {
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
