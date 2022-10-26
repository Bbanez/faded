import {
  defineComponent,
  onMounted,
  onUnmounted,
  ref,
} from '@vue/runtime-core';
import { Ticker } from 'svemir';
import { AssetLoader, DevPanel } from '../components';
import { createGame, Panel } from '../game';
import type { Game } from '../game/types';

const component = defineComponent({
  setup() {
    const container = ref<HTMLElement | null>(null);
    let game: Game | undefined;
    const fTime = 16;
    const interval = setInterval(() => {
      Ticker.tick();
    }, fTime);

    onMounted(async () => {
      if (container.value) {
        game = await createGame({
          element: container.value,
          // frameTicker: true,
        });
        Panel.addGroup({
          name: 'Ticker',
          extended: true,
          items: [
            {
              name: 'Frame time',
              value: fTime,
              type: 'input',
              onChange: (value) => {
                clearInterval(interval);
                setInterval(() => {
                  Ticker.tick();
                }, value);
              },
            },
          ],
        });
      } else {
        throw Error('Container is not available.');
      }
    });

    onUnmounted(async () => {
      clearInterval(interval);
      if (game) {
        await game.destroy();
      }
      if (container.value) {
        container.value.innerHTML = '';
      }
      window.location.reload();
    });

    return () => (
      <div class="main">
        <div class="faded" ref={container} />
        {window.location.host.startsWith('localhost:') && <DevPanel />}
        <AssetLoader />
      </div>
    );
  },
});
export default component;
