import { AssetLoaderBar } from '@fdd/components/asset-loader';
import { LoaderPage } from '@fdd/components/loader';
import { GameManager } from '@fdd/game/main';
import { useSdk } from '@fdd/sdk';
import { throwable } from '@fdd/util/throwable';
import {
    computed,
    defineComponent,
    onBeforeUnmount,
    onMounted,
    ref,
} from 'vue';
import { useRoute } from 'vue-router';

export const GameView = defineComponent({
    setup() {
        const sdk = useSdk();
        const route = useRoute();

        const gameCanvasContainer = ref<HTMLDivElement>(null as never);
        const loaded = ref(false);
        const params = computed(
            () =>
                route.params as {
                    accountId: string;
                    mapId: string;
                    gameId: string;
                },
        );
        // const game = computed(() =>
        //     sdk.game.store.findById(params.value.gameId),
        // );
        // const hero1 = computed(() =>
        //     sdk.hero.store.findById(game.value?.players[0].hero.id || ''),
        // );
        let gameManager: GameManager = null as never;

        onMounted(async () => {
            await throwable(async () => {
                await sdk.hero.getAll();
                const gamee = await sdk.game.get(params.value.gameId);
                const gameMap = await sdk.gameMap.get(params.value.mapId);
                const navMesh = await sdk.gameMap.navMeshMetadata(gameMap.id);
                gameManager = new GameManager(
                    sdk,
                    gameCanvasContainer.value,
                    gamee,
                    gameMap,
                    true,
                    navMesh,
                );
                await gameManager.initialize();
            });
            loaded.value = true;
        });

        onBeforeUnmount(() => {
            if (gameManager) {
                gameManager.destroy();
            }
        });

        return () => (
            <div class={`w-full h-full`}>
                
                {!loaded.value ? (
                    <LoaderPage show>
                        <div>Loading game ...</div>
                    </LoaderPage>
                ) : (
                    ''
                )}
                <div
                    ref={gameCanvasContainer}
                    class={`${loaded.value ? 'flex' : 'hidden'} top-0 left-0 w-full h-full`}
                />
                <AssetLoaderBar />
            </div>
        );
    },
});
