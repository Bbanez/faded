import { AssetLoaderBar } from '@fdd/components/asset-loader';
import { LoaderPage } from '@fdd/components/loader';
import { useSdk } from '@fdd/sdk';
import { throwable } from '@fdd/util/throwable';
import { computed, defineComponent, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

export const GameView = defineComponent({
    setup() {
        const sdk = useSdk();
        const route = useRoute();

        const loaded = ref(false);
        const params = computed(
            () =>
                route.params as {
                    accountId: string;
                    mapId: string;
                    gameId: string;
                },
        );
        const game = computed(() =>
            sdk.game.store.findById(params.value.gameId),
        );
        const hero1 = computed(() =>
            sdk.hero.store.findById(game.value?.p1.hero.id || ''),
        );

        onMounted(async () => {
            await throwable(async () => {
                await sdk.game.get(params.value.gameId);
                await sdk.hero.getAll();
            });
        });

        return () => (
            <div class={`w-full h-full`}>
                {!game.value || !hero1.value || !loaded.value ? (
                    <LoaderPage show>
                        <div>Loading game ...</div>
                    </LoaderPage>
                ) : (
                    <div>YO</div>
                )}
                <AssetLoaderBar />
            </div>
        );
    },
});
