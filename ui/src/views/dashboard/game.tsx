import { createGame, Game } from '@ui/game';
import { Point2D } from 'svemir';
import { defineComponent, onMounted, onUnmounted, ref } from 'vue';

export default defineComponent({
  setup() {
    const canvas = ref<null | HTMLElement>(null);
    let game: Game;

    onMounted(async () => {
      if (canvas.value) {
        game = await createGame({
          canvas: canvas.value,
          mapId: '0',
          camLookAt: new Point2D(20, 85),
        });
        console.log(game);
      }
    });

    onUnmounted(() => {
      game.destroy();
    });

    return () => (
      <div class="game">
        <div class="game--canvas" ref={canvas} />
        {/* <div class="game--edge">
          <div class="game--edge-item game--edge-top" />
          <div class="game--edge-item game--edge-topRight" />
          <div class="game--edge-item game--edge-right" />
          <div class="game--edge-item game--edge-rightBottom" />
          <div class="game--edge-item game--edge-bottom" />
          <div class="game--edge-item game--edge-bottomLeft" />
          <div class="game--edge-item game--edge-left" />
          <div class="game--edge-item game--edge-leftTop" />
        </div> */}
      </div>
    );
  },
});
