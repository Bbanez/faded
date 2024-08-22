import { AssetLoader, AssetLoaderCallbackData } from '@fdd/util/asset-loader';
import { UnsubscribeFns, callAndClearUnsubscribeFns } from '@fdd/util/sub';
import { defineComponent, onBeforeUnmount, onMounted, ref } from 'vue';

export const AssetLoaderBar = defineComponent({
    setup() {
        const loaderData = ref<AssetLoaderCallbackData>({
            items: [],
            loadedItemsCount: 1,
            type: 'done',
        });
        const unsubs: UnsubscribeFns = [];

        onMounted(() => {
            unsubs.push(
                AssetLoader.subscribe((data) => {
                    loaderData.value = data;
                }),
            );
        });

        onBeforeUnmount(() => {
            callAndClearUnsubscribeFns(unsubs);
        });

        return () => (
            <>
                {loaderData.value &&
                    loaderData.value.item &&
                    loaderData.value.type === 'progress' && (
                        <div
                            class={`fixed bottom-0 right-0 p-4 flex flex-col gap-2 text-xs bg-black`}
                        >
                            <div>
                                [{loaderData.value.loadedItemsCount}/
                                {loaderData.value.items.length}]{' '}
                                {loaderData.value.item.name}
                            </div>
                            <div class={`w-full h-1 bg-gray-800`}>
                                <div
                                    class={`bg-amber-500 h-full`}
                                    style={`
                                        width: ${loaderData.value.item.progress}%;
                                    `}
                                ></div>
                            </div>
                        </div>
                    )}
            </>
        );
    },
});
