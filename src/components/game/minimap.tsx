import {
    defineComponent,
    onBeforeUnmount,
    onMounted,
    PropType,
    ref,
} from 'vue';
import type { Game } from '../../game';
import { bcms } from '../../game/bcms.ts';
import { FunctionBuilder } from '../../game/math/function-builder.ts';
import { Ticker } from '../../game/ticker.ts';
import type { FddLayoutEntryMeta, FddMapEntryMeta } from '../../types/bcms';

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
        const layout = ref<FddLayoutEntryMeta>();
        const mapInfo = ref<FddMapEntryMeta>();
        const data = ref<MinimapData>({
            player: {
                name: 'unknown',
                position: [0, 0],
            },
        });
        const unsub: Array<() => void> = [];
        let refreshAt = 0;

        onMounted(() => {
            layout.value = bcms.layout[0];
            mapInfo.value = bcms.maps[0];
            const gameToMapSpace = [
                FunctionBuilder.linear2D([
                    [0, 0],
                    [mapInfo.value?.width || 0, 256],
                ]),
                FunctionBuilder.linear2D([
                    [0, 0],
                    [mapInfo.value?.height || 0, 256],
                ]),
            ];
            unsub.push(
                Ticker.subscribe(async (cTime) => {
                    if (refreshAt < cTime) {
                        if (props.game.player && data.value.player) {
                            const playerPosition: [number, number] = [
                                gameToMapSpace[0](
                                    props.game.player.rust.obj.position[1],
                                ),
                                gameToMapSpace[1](
                                    props.game.player.rust.obj.position[0],
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
                    class={`absolute w-[256px] h-[256px] bg-gray-500 top-[28px] right-[20px]`}
                >
                    <img
                        class={`w-full h-full`}
                        src={mapInfo.value?.cover.src}
                        alt="Map cover"
                    />
                </div>

                <div
                    class={`absolute bg-red-500 w-2 h-2 rounded-full`}
                    style={`top: ${(28 + data.value.player.position[0]).toFixed(
                        0,
                    )}px; left: ${(20 + data.value.player.position[1]).toFixed(
                        0,
                    )}px;`}
                />
                <div
                    class={`relative`}
                    v-html={layout.value?.map_elements.minimap.svg || ''}
                />
            </div>
        );
    },
});
