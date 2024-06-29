import { computed, defineComponent, onMounted } from 'vue';
import { useSdk } from '../sdk/main.ts';
import { throwable } from '../util/throwable.ts';
import { Button } from '../components/button.tsx';
import { useRouter } from 'vue-router';

export const MapMakerSelectView = defineComponent({
    setup() {
        const sdk = useSdk();
        const router = useRouter();
        const landscapes = computed(() => sdk.landscape.store.items());
        const activeAccount = computed(() =>
            sdk.account.store.methods.findActive(),
        );

        onMounted(async () => {
            await throwable(async () => {
                await sdk.landscape.getAll();
            });
        });

        function getListItem(
            title: string,
            description: string,
            onClick: () => Promise<void>,
        ) {
            return (
                <Button class={`flex bg-gray-300 p-2`} onClick={onClick}>
                    {/*<div class={`w-40 h-40 flex-shrink-0`}>*/}
                    {/*    <img*/}
                    {/*        class={`w-full h-full object-cover`}*/}
                    {/*        src={image}*/}
                    {/*        alt={title}*/}
                    {/*    />*/}
                    {/*</div>*/}
                    <div class={`text-left text-black flex flex-col pl-2`}>
                        <div class={`text-lg`}>{title}</div>
                        <div class={`text-xs`}>{description}</div>
                    </div>
                </Button>
            );
        }

        return () => (
            <div class={`flex flex-col items-center min-h-full`}>
                {landscapes.value.length === 0 ? (
                    <div class={`text-2xl m-auto px-8 py-4 bg-gray-500`}>No available maps</div>
                ) : (
                    landscapes.value.map((landscape) => {
                        return getListItem(
                            landscape.name,
                            landscape.desc,
                            async () => {
                                await router.push(
                                    `/account/${activeAccount.value?.username}/map-maker/${landscape.id}`,
                                );
                            },
                        );
                    })
                )}
            </div>
        );
    },
});
