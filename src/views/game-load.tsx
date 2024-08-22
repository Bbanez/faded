import { computed, defineComponent, onMounted, ref } from 'vue';
import { useSdk } from '@fdd/sdk/main.ts';
import { throwable } from '@fdd/util/throwable.ts';
import { Link } from '@fdd/components/link';
import { useRoute } from 'vue-router';

export const GameLoadView = defineComponent({
    setup() {
        const sdk = useSdk();
        const route = useRoute();
        const loaded = ref(false);
        const games = computed(() => sdk.game.store.items());

        onMounted(async () => {
            await throwable(async () => {
                await sdk.game.getAll();
            });
            loaded.value = true;
        });

        return () => (
            <div class={`flex flex-col gap-4 p-4`}>
                {loaded.value && (
                    <div class={`flex flex-col`}>
                        {games.value.length === 0 ? (
                            <div>No games to load</div>
                        ) : (
                            games.value.map((game) => {
                                return (
                                    <Link
                                        href={`/account/${route.params.accountId}/game/${game.id}/map/${game.map_id}`}
                                        class={`flex items-center bg-gray-800 text-white`}
                                    >
                                        {game.id}
                                    </Link>
                                );
                            })
                        )}
                    </div>
                )}
            </div>
        );
    },
});
