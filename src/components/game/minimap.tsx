import {
    computed,
    defineComponent,
    onBeforeUnmount,
    onMounted,
    PropType,
    ref,
} from 'vue';
import type { Game } from '../../game';
import { FunctionBuilder } from '../../game/math/function-builder.ts';
import { Ticker } from '../../game/ticker.ts';
import { useSdk } from '../../sdk/main.ts';
import { useRoute } from 'vue-router';
import { Icon } from '../icon.tsx';

export interface MinimapData {
    player: {
        name: string;
        position: [number, number];
    };
}

export const Minimap = defineComponent({
    props: {
        game: {
            type: Object as PropType<Game>,
            required: true,
        },
    },
    setup(props) {
        const sdk = useSdk();
        const route = useRoute();
        const map = computed(() =>
            sdk.data.mapStore.findById(route.params.mapId as string),
        );
        const data = ref<MinimapData>({
            player: {
                name: 'unknown',
                position: [0, 0],
            },
        });
        const unsub: Array<() => void> = [];
        let refreshAt = 0;

        onMounted(async () => {
            const mapInfo = (await sdk.data.maps()).find(
                (e) => e.id === route.params.mapId,
            );
            if (!mapInfo) {
                throw Error('Map not found');
            }
            const gameToMapSpace = [
                FunctionBuilder.linear2D([
                    [0, 0],
                    [mapInfo.width || 0, 256],
                ]),
                FunctionBuilder.linear2D([
                    [0, 0],
                    [mapInfo.height || 0, 256],
                ]),
            ];
            unsub.push(
                Ticker.subscribe(async (cTime) => {
                    if (refreshAt < cTime) {
                        if (props.game.player && data.value.player) {
                            const playerPosition: [number, number] = [
                                gameToMapSpace[0](
                                    props.game.player.manager.player
                                        .bounding_box.position.y,
                                ),
                                gameToMapSpace[1](
                                    props.game.player.manager.player
                                        .bounding_box.position.x,
                                ),
                            ];
                            if (
                                playerPosition[0] !==
                                    data.value.player.position[0] ||
                                playerPosition[1] !==
                                    data.value.player.position[1]
                            ) {
                                refreshAt = cTime + 100;
                                data.value.player.position = playerPosition;
                            }
                        }
                    }
                }),
            );
        });

        onBeforeUnmount(() => {
            unsub.forEach((e) => e());
        });

        return () => (
            <div class={`fixed top-4 right-4`}>
                <div
                    class={`absolute z-10 w-[256px] h-[256px] bg-gray-500 top-[28px] right-[20px]`}
                >
                    <img
                        class={`w-full h-full`}
                        src={`/assets/maps/${map.value?.id}/cover.jpg`}
                        alt="Map cover"
                    />
                </div>

                <div
                    class={`z-20 absolute bg-red-500 w-2 h-2 rounded-full`}
                    style={`top: ${(28 + data.value.player.position[0]).toFixed(
                        0,
                    )}px; left: ${(20 + data.value.player.position[1]).toFixed(
                        0,
                    )}px;`}
                />
                <Icon class={`relative z-20`} src={`/assets/map-frame.svg`} />
            </div>
        );
    },
});
