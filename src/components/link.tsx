import { PropType, defineComponent } from 'vue';
import { DefaultComponentProps } from './_default';
import { PageNames, useRoute } from '../router';

export const Link = defineComponent({
  props: {
    ...DefaultComponentProps,
    href: {
      type: String as PropType<PageNames>,
      required: true,
    },
  },
  setup(props, ctx) {
    const route = useRoute();

    return () => (
      <a
        id={props.id}
        class={props.class}
        style={props.style}
        href={props.href}
        onClick={(event) => {
          event.preventDefault();
          route.push(props.href);
        }}
      >
        {ctx.slots.default ? ctx.slots.default() : ''}
      </a>
    );
  },
});
