import { computed, defineComponent, onMounted, PropType, ref } from 'vue';
import type { Game } from '../../game';
import { findChild } from '../../util/dom';
import { FunctionBuilder } from '../../game/math/function-builder.ts';
import { Ticker } from '../../game/ticker.ts';
import { Link } from '../link.tsx';
import { Icon } from '../icon.tsx';
import { useSdk } from '../../sdk/main.ts';
import { throwable } from '../../util/throwable.ts';
import { useRoute } from 'vue-router';

export const CharCover = defineComponent({
    props: {
        game: {
            type: Object as PropType<Game>,
            required: true,
        },
    },
    setup(props) {
        const route = useRoute();
        const sdk = useSdk();
        const svgRef = ref<HTMLDivElement | null>(null);
        const activeAccount = computed(() =>
            sdk.account.store.methods.findActive(),
        );
        const expTransFn = FunctionBuilder.linear2D([
            [0, 124],
            [100, 300.5],
        ]);
        const unsubs: Array<() => void> = [];
        let tickAt = 0;

        async function calcExp(cTime: number) {
            if (tickAt < cTime) {
                tickAt = cTime + 100;
                const stats = props.game.manager.player.stats;
                if (svgRef.value) {
                    const expEl = findChild(svgRef.value.children, (child) => {
                        if (child.getAttribute('fill') === '#24CEC4') {
                            return child;
                        }
                    });
                    if (expEl) {
                        const d = expEl.getAttribute('d');
                        if (d) {
                            const parts = d.split(' ');
                            if (parts[2]) {
                                const width = expTransFn(
                                    (stats.level_partial - stats.level) * 100,
                                );
                                parts[2] = `100H${width}L${width + 5}`;
                                expEl.setAttribute('d', parts.join(' '));
                            }
                        }
                    }
                }
            }
        }

        onMounted(async () => {
            await throwable(
                async () => {
                    await sdk.account.get_all();
                    return await sdk.player.get();
                },
                async () => {
                    if (svgRef.value) {
                        const res = await fetch('/assets/char-ui.svg');
                        svgRef.value.innerHTML = await res.text();
                    }
                    unsubs.push(
                        Ticker.subscribe(async (cTime) => {
                            await calcExp(cTime);
                        }),
                    );
                },
            );
        });

        return () => (
            <div class={`fixed top-4 left-4`}>
                <div ref={svgRef} />
                <div class={`fixed top-4 left-4`}>
                    <img
                        class={`relative rounded-full w-[89px] h-[89px] left-[37px] top-[30px]`}
                        src={`/assets/characters/${props.game.character.id}/cover.png`}
                        alt={activeAccount.value?.username}
                    />
                    <div
                        class={`absolute text-xs text-center`}
                        style={`top: 53px; left: 138px`}
                    >
                        {props.game.manager.player.stats.level}
                    </div>
                    <div
                        class={`absolute text-xs text-left overflow-hidden truncate`}
                        style={`width: 180px; top: 74px; left: 138px;`}
                    >
                        {activeAccount.value?.username}
                    </div>
                    <Link
                        class={`absolute`}
                        style={`top: 112px; left: 152px;`}
                        href={`/account/${route.params.username}`}
                    >
                        <Icon
                            class={`stroke-emerald-400 w-3 h-3`}
                            src={`/feather/home`}
                        />
                    </Link>
                </div>
            </div>
        );
    },
});
