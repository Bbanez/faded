import { defineComponent, onMounted, onBeforeUnmount, ref } from 'vue';
import { Minimap } from '../components/game/minimap';
import { CharCover } from '../components/game/char-cover';
import { Game } from '../game';
import { loadBcmsData } from '../game/bcms';

export interface GameViewData {}

export const GameView = defineComponent({
    setup() {
        const el = ref<HTMLDivElement>(null as never);
        let game: Game | null = null;
        const mounted = ref(false);

        onMounted(async () => {
            await loadBcmsData();
            if (el.value) {
                game = new Game({
                    el: el.value,
                    mapSlug: 'demo',
                    frameTicker: true,
                });
                await game.run();
                el.value.appendChild(game.fpsEl);
            }
            mounted.value = true;
        });

        onBeforeUnmount(() => {
            if (game) {
                game.destroy();
            }
        });

        return () => (
            <div draggable={false} unselectable={'on'}>
                {/*<h1>Game</h1>*/}
                {/*<Link href="home">Go to Home</Link>*/}
                {/*<button*/}
                {/*  onClick={async () => {*/}
                {/*    console.log(*/}
                {/*      await invoke('player_load', {*/}
                {/*        screenWidth: window.innerWidth,*/}
                {/*        screenHeight: window.innerHeight,*/}
                {/*      }),*/}
                {/*    );*/}
                {/*  }}*/}
                {/*>*/}
                {/*  Test*/}
                {/*</button>*/}
                {mounted.value && (
                    <>
                        <Minimap game={game as Game} />
                        <CharCover game={game as Game} />
                    </>
                )}
                <div class={`flex fixed bottom-0`}>
                    <div>
                        <div class={`flex gap-1`}>
                            <div class={`flex flex-col gap-1`}>
                                <div class={`text-amber-700`}>Damage:</div>
                                <div class={`flex gap-1`}>
                                    <span>13 - 37</span>
                                    <span class={`text-lime-700`}>+21</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="absolute top-0 left-0 w-screen h-screen -z-10" ref={el} />
            </div>
        );
    },
});
