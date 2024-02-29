import { defineComponent, onMounted, PropType, ref } from 'vue';
import type { Game } from '../../game';
import { FddCharacterEntryMeta, FddLayoutEntryMeta } from '../../types';
import { bcms } from '../../game/bcms.ts';
import { findChild } from '../../util/dom';

export const CharCover = defineComponent({
  props: {
    game: {
      type: Object as PropType<Game>,
      required: true,
    },
  },
  setup(_props) {
    const layout = ref<FddLayoutEntryMeta>();
    const charInfo = ref<FddCharacterEntryMeta>();
    const svgRef = ref<HTMLDivElement | null>(null);
    const expEl = ref<HTMLElement>();

    onMounted(() => {
      layout.value = bcms.layout[0];
      charInfo.value = bcms.characters[0];
      setTimeout(() => {
        if (svgRef.value) {
          const el = findChild(svgRef.value.children, (child) => {
            if (child.getAttribute('filter') === 'url(#filter4_di_2_29)') {
              return child;
            }
          });
          if (el) {
            expEl.value = document.createElement('div');
            expEl.value.setAttribute('style', 'bg-red h-2 w-[200px]')
            el.appendChild(expEl.value)
          }
        }
      }, 20);
    });

    return () => (
      <div class={`fixed top-4 left-4`}>
        <div ref={svgRef} v-html={layout.value?.map_elements.char.svg || ''} />
      </div>
    );
  },
});
