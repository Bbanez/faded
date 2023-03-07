import { Game } from '@/game';
import { defineComponent, onMounted, ref } from 'vue';

export default defineComponent({
  setup() {
    const container = ref<HTMLDivElement | null>(null);

    onMounted(async () => {
      if (container.value) {
        Game.create(container.value);
      }
    });

    return () => (
      <div class="home">
        <div class="game" ref={container} />
      </div>
    );
  },
});
