import { defineComponent, ref, type PropType, onMounted } from 'vue';
import { DefaultComponentProps } from './default-props';
import { useRoute } from 'vue-router';

export type ScrollableItem = JSX.Element | { id: string; value: JSX.Element };

export const Scrollable = defineComponent({
  props: {
    ...DefaultComponentProps,
    itemHeight: {
      type: Number,
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },
    items: {
      type: Array as PropType<ScrollableItem[]>,
      default: () => [],
    },
  },
  emits: {
    scrollFrom: (_: number) => {
      return true;
    },
  },
  setup(props, ctx) {
    const route = useRoute();
    const container = ref<HTMLDivElement>();
    const fromIndex = ref(0);
    const toIndex = ref(0);

    function onScroll() {
      if (container.value) {
        fromIndex.value = parseInt(
          `${container.value.scrollTop / props.itemHeight}`,
        );
        toIndex.value = parseInt(
          `${
            (container.value.scrollTop + container.value.offsetHeight) /
            props.itemHeight
          }`,
        );
        ctx.emit('scrollFrom', fromIndex.value);
      }
    }

    onMounted(() => {
      onScroll();
      if (route.query.id && container.value) {
        try {
          const el = container.value.querySelector(`#${route.query.id}`);
          if (el) {
            el.scrollIntoView();
          }
        } catch (error) {
          console.warn(error);
        }
      }
    });

    return () => (
      <div
        ref={container}
        id={props.id}
        class={`scrollable ${props.class || ''}`}
        style={`height: ${props.height}px; overflow-y: auto; ${
          props.style || ''
        }`}
        onScroll={() => {
          onScroll();
        }}
      >
        {props.items.map((item, itemIdx) => {
          if (itemIdx < fromIndex.value || itemIdx > toIndex.value) {
            return (
              <div
                id={(item as any).id}
                class="scrollable--item_empty"
                style={`height: ${props.itemHeight}px`}
              />
            );
          }
          return (
            <div
              class="scrollable--item"
              style={`height: ${props.itemHeight}px`}
            >
              {(item as any).value ? (item as any).value : item ? item : ''}
            </div>
          );
        })}
      </div>
    );
  },
});
