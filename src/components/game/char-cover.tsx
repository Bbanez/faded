import { defineComponent, onMounted, PropType, ref } from 'vue';
import type { Game } from '../../game';
import { bcms } from '../../game/bcms.ts';
import { findChild } from '../../util/dom';
import { FunctionBuilder } from '../../game/math/function-builder.ts';
import { Ticker } from '../../game/ticker.ts';
import { useActiveAccount } from '../../hooks/account.ts';
import type {
    FddCharacterEntryMeta,
    FddLayoutEntryMeta,
} from '../../types/bcms';

export const CharCover = defineComponent({
    props: {
        game: {
            type: Object as PropType<Game>,
            required: true,
        },
    },
    setup() {
        const layout = ref<FddLayoutEntryMeta>();
        const charInfo = ref<FddCharacterEntryMeta>();
        const svgRef = ref<HTMLDivElement | null>(null);
        const activeAccountQuery = useActiveAccount();
        const expTransFn = FunctionBuilder.linear2D([
            [0, 124],
            [100, 300.5],
        ]);
        const unsubs: Array<() => void> = [];
        let tickAt = 0;

        onMounted(() => {
            layout.value = bcms.layout[0];
            charInfo.value = bcms.characters[0];
            if (svgRef.value) {
                svgRef.value.innerHTML =
                    layout.value?.map_elements.char.svg || '';
            }
            unsubs.push(
                Ticker.subscribe(async (cTime) => {
                    if (tickAt < cTime) {
                        tickAt = cTime + 100;
                        if (svgRef.value) {
                            const expEl = findChild(
                                svgRef.value.children,
                                (child) => {
                                    if (
                                        child.getAttribute('fill') === '#24CEC4'
                                    ) {
                                        return child;
                                    }
                                },
                            );
                            if (expEl) {
                                const d = expEl.getAttribute('d');
                                if (d) {
                                    const parts = d.split(' ');
                                    if (parts[2]) {
                                        const width = expTransFn(10);
                                        parts[2] = `100H${width}L${width + 5}`;
                                        expEl.setAttribute(
                                            'd',
                                            parts.join(' '),
                                        );
                                    }
                                }
                            }
                        }
                    }
                }),
            );
        });

        return () => (
            <div class={`fixed top-4 left-4`}>
                <div ref={svgRef} />
                <div class={`fixed top-4 left-4`}>
                    <img
                        class={`relative rounded-full w-[89px] h-[89px] left-[37px] top-[30px]`}
                        src={charInfo.value?.avatar.src}
                        alt={activeAccountQuery.data.value?.username}
                    />
                </div>
            </div>
        );
    },
});
