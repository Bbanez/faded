import {
  defineComponent,
  onMounted,
  onUnmounted,
  ref,
} from '@vue/runtime-core';
import { createGame } from './game';
import type { Game } from './game/types';

const component = defineComponent({
  setup() {
    const container = ref<HTMLElement | null>(null);
    let game: Game | undefined;

    onMounted(async () => {
      if (container.value) {
        game = await createGame({
          element: container.value,
          frameTicker: true,
        });
      } else {
        throw Error('Container is not available.');
      }
    });

    onUnmounted(async () => {
      if (game) {
        await game.destroy();
      }
      if (container.value) {
        container.value.innerHTML = '';
      }
      window.location.reload();
    });

    return () => <div class="faded" ref={container} />;
  },
});
export default component;
