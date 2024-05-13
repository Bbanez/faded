import { computed, defineComponent, onMounted, ref } from 'vue';
import { Button } from '../components/button.tsx';
import { useRoute, useRouter } from 'vue-router';
import { Map } from '../types/rs';
import { useSdk } from '../sdk/main.ts';
import { throwable } from '../util/throwable.ts';

export const GameStartView = defineComponent({
    setup() {
        const sdk = useSdk();
        const router = useRouter();
        const route = useRoute();
        const loaded = ref(false);
        const selected_map = ref<Map>();
        const maps = computed(() => sdk.data.mapStore.items());
        const characters = computed(() => sdk.data.characterStore.items());

        onMounted(async () => {
            await throwable(async () => {
                await sdk.data.maps();
                await sdk.data.characters();
            });

            loaded.value = true;
        });

        function getListItem(
            image: string,
            title: string,
            description: string,
            onClick: () => Promise<void>,
        ) {
            return (
                <Button class={`flex bg-gray-300 p-2`} onClick={onClick}>
                    <div class={`w-40 h-40 flex-shrink-0`}>
                        <img
                            class={`w-full h-full object-cover`}
                            src={image}
                            alt={title}
                        />
                    </div>
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
                                <h1>Select character</h1>
                                {characters.value.map((char) => {
                                    return getListItem(
                                        `/assets/characters/${char.id}/cover.png`,
                                        char.title,
                                        char.description,
                                        async () => {
                                            await throwable(
                                                async () => {
                                                    return await sdk.manager.create(
                                                        selected_map.value
                                                            ?.id as string,
                                                        char.id,
                                                    );
                                                },
                                                async (manager) => {
                                                    await router.push(
                                                        `/account/${route.params.account_id}/map/${selected_map.value?.id}/character/${char.id}/game/${manager.id}`,
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
                                {maps.value.map((map) => {
                                    return getListItem(
                                        `/assets/maps/${map.id}/cover.png`,
                                        map.title,
                                        map.description,
                                        async () => {
                                            selected_map.value = map;
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
