import { defineComponent, onMounted, ref } from 'vue';
import { Button } from '@fdd/components/button.tsx';
import { useSdk } from '@fdd/sdk/main.ts';
import { throwable } from '@fdd/util/throwable.ts';
import { GameMapLite } from '@fdd/types/rs/GameMapLite.ts';
import { Hero } from '@fdd/types/rs/Hero.ts';
import { useRoute, useRouter } from 'vue-router';

export const GameStartView = defineComponent({
    setup() {
        const sdk = useSdk();
        const router = useRouter();
        const route = useRoute();
        const loaded = ref(false);
        const selected_map = ref<GameMapLite>();
        const gameMaps = ref<GameMapLite[]>([]);
        const heros = ref<Hero[]>([]);

        onMounted(async () => {
            await throwable(
                async () => {
                    return {
                        gameMaps: await sdk.gameMap.getAll(),
                        heros: await sdk.hero.getAll(),
                    };
                },
                async (result) => {
                    gameMaps.value = result.gameMaps;
                    heros.value = result.heros;
                },
            );

            loaded.value = true;
        });

        function getListItem(
            image: string | null,
            title: string,
            description: string,
            onClick: () => Promise<void>,
        ) {
            return (
                <Button class={`flex bg-gray-300 p-2`} onClick={onClick}>
                    {image && (
                        <div class={`w-40 h-40 flex-shrink-0`}>
                            <img
                                class={`w-full h-full object-cover`}
                                src={image}
                                alt={title}
                            />
                        </div>
                    )}
                    <div class={`text-left text-black flex flex-col pl-2`}>
                        <div class={`text-lg`}>{title}</div>
                        <div class={`text-xs`}>{description}</div>
                    </div>
                </Button>
            );
        }

        return () => (
            <div class={`flex flex-col gap-4 p-4`}>
                {loaded.value && (
                    <>
                        {}
                        {selected_map.value ? (
                            <>
                                <h1>Select a Hero</h1>
                                {heros.value.map((hero) => {
                                    return getListItem(
                                        `/assets/heros/${hero.id}/cover.png`,
                                        hero.name,
                                        hero.desc,
                                        async () => {
                                            await throwable(
                                                async () => {
                                                    return await sdk.game.create(
                                                        route.params
                                                            .accountId as string,
                                                        hero.id,
                                                        selected_map.value
                                                            ?.id as string,
                                                    );
                                                },
                                                async (game) => {
                                                    await router.push(
                                                        `/account/${route.params.accountId}/map/${selected_map.value?.id}/game/${game.id}`,
                                                    );
                                                },
                                            );
                                        },
                                    );
                                })}
                            </>
                        ) : (
                            <>
                                <h1>Select a map</h1>
                                {gameMaps.value.map((gameMap) => {
                                    return getListItem(
                                        // `/assets/maps/${map.id}/cover.png`,
                                        null,
                                        gameMap.name,
                                        gameMap.desc,
                                        async () => {
                                            selected_map.value = gameMap;
                                        },
                                    );
                                })}
                            </>
                        )}
                    </>
                )}
            </div>
        );
    },
});
