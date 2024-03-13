import { defineComponent, onMounted, PropType, ref } from 'vue';
import { Game } from '../../game';
import { FddCharacterEntryMeta, FddLayoutEntryMeta } from '../../types/bcms';
import { useActiveAccount } from '../../hooks/account';
import { FunctionBuilder } from '../../game/math';
import { bcms } from '../../game/bcms';
import { Ticker } from '../../game/ticker';
import { findChild } from '../../util/dom';

export const CharCover = defineComponent({
    props: {
        game: {
            type: Object as PropType<Game>,
            required: true,
        },
    },
    setup(props) {
        const layout = ref<FddLayoutEntryMeta>();
        const charInfo = ref<FddCharacterEntryMeta>();
        const svgRef = ref<HTMLDivElement | null>(null);
        const acticeAccountQuery = useActiveAccount();
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
                svgRef.value.innerHTML = layout.value.map_elements.char.svg || '';
            }
            unsubs.push(
                Ticker.subscribe(async (cTime) => {
                    if (tickAt < cTime) {
                        tickAt = cTime + 100;
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
                                        const width = expTransFn(10);
                                        parts[2] = `100H${width}L${width + 5}`;
                                        expEl.setAttribute('d', parts.join(' '));
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
                        alt={acticeAccountQuery.data.value?.username}
                    />
                </div>
            </div>
        );
    },
});
