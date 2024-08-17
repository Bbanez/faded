import { Button } from '@fdd/components/button';
import { useSdk } from '@fdd/sdk';
import { GameMapLite } from '@fdd/types/rs';
import { throwable } from '@fdd/util/throwable';
import { computed, defineComponent, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

export const MapMakerSelectView = defineComponent({
    setup() {
        const sdk = useSdk();
        const router = useRouter();
        const gameMaps = ref<GameMapLite[]>([]);
        const activeAccount = computed(() =>
            sdk.account.store.methods.findActive(),
        );

        onMounted(async () => {
            await throwable(async () => {
                gameMaps.value = await sdk.gameMap.getAll();
            });
        });

        function getListItem(
            title: string,
            description: string,
            onClick: () => Promise<void>,
        ) {
            return (
                <Button class={`flex bg-gray-300 p-2`} onClick={onClick}>
                    <div class={`text-left text-black flex flex-col pl-2`}>
                        <div class={`text-lg`}>{title}</div>
                        <div class={`text-xs`}>{description}</div>
                    </div>
                </Button>
            );
        }

        return () => (
            <div class={`flex flex-col items-center min-h-full`}>
                {gameMaps.value.length === 0 ? (
                    <div class={`text-2xl m-auto px-8 py-4 bg-gray-500`}>
                        No available maps
                    </div>
                ) : (
                    gameMaps.value.map((gameMap) => {
                        return getListItem(
                            gameMap.name,
                            gameMap.desc,
                            async () => {
                                await router.push(
                                    `/account/${activeAccount.value?.username}/map-maker/${gameMap.id}`,
                                );
                            },
                        );
                    })
                )}
            </div>
        );
    },
});
