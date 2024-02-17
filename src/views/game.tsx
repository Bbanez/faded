import { defineComponent, onMounted, onUnmounted, ref } from 'vue';
import { Link } from '../components';
import { Game } from '../game';
import { invoke } from '@tauri-apps/api';

export const GameView = defineComponent({
  setup() {
    const el = ref<HTMLDivElement>(null as never);
    let game: Game;

    onMounted(async () => {
      if (el.value) {
        game = new Game({
          el: el.value,
          mapSlug: 'demo',
          frameTicker: true,
        });
        await game.run();
        // const scene = new Scene();
        // const camera = new PerspectiveCamera(
        //   75,
        //   window.innerWidth / window.innerHeight,
        //   0.1,
        //   1000
        // );

        // const geometry = new BoxGeometry(1, 1, 1);
        // const material = new MeshBasicMaterial({ color: 0x00ff00 });
        // const cube = new Mesh(geometry, material);
        // scene.add(cube);

        // camera.position.z = 5;

        // const renderer = new WebGLRenderer();
        // scene.background = new Color(255, 0, 0);
        // renderer.setSize(window.innerWidth, window.innerHeight);
        // el.value.appendChild(renderer.domElement);

        // function animate() {
        //   requestAnimationFrame(animate);

        //   cube.rotation.x += 0.01;
        //   cube.rotation.y += 0.01;

        //   renderer.render(scene, camera);
        // }

        // animate();
      }
      // if (el) {
      // }
    });

    onUnmounted(() => {
      if (game) {
        game.destroy();
      }
    });

    return () => (
      <div>
        <h1>Game</h1>
        <Link href="home">Go to Home</Link>
        <button
          onClick={async () => {
            console.log(
              await invoke('player_load', {
                screenWidth: window.innerWidth,
                screenHeight: window.innerHeight,
              })
            );
          }}
        >
          Test
        </button>
        <div class="absolute top-0 left-0 w-screen h-screen -z-10" ref={el} />
      </div>
    );
  },
});
