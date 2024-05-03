import { defineComponent, onMounted, onBeforeUnmount, ref } from 'vue';
import { createGame, Game } from '../game';
import { Minimap } from '../components/game/minimap';
import { CharCover } from '../components/game/char-cover';
import { useRoute } from 'vue-router';
import { useSdk } from '../sdk/main.ts';
import { throwable } from '../util/throwable.ts';

export const GameView = defineComponent({
    setup() {
        const sdk = useSdk();
        const route = useRoute();
        const el = ref<HTMLDivElement>(null as never);
        let game: Game | null = null;
        const mounted = ref(false);

        onMounted(async () => {
            await throwable(async () => {
                if (el.value) {
                    const manager = await sdk.manager.get(
                        route.params.managerId as string,
                    );
                    console.log({m: manager})
                    game = await createGame({
                        el: el.value,
                        frameTicker: true,
                        mapId: route.params.mapId as string,
                        characterId: route.params.characterId as string,
                        manager,
                    });
                    console.log({game})
                    await game.run();
                    el.value.appendChild(game.fpsEl);
                }
                mounted.value = true;

            })
        });

        onBeforeUnmount(() => {
            if (game) {
                game.destroy();
            }
        });

        return () => (
            <div draggable={false} unselectable={'on'}>
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
                <div
                    class="absolute top-0 left-0 w-screen h-screen -z-10"
                    ref={el}
                />
            </div>
        );
    },
});
