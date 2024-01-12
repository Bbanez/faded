import { PropType, defineComponent } from 'vue';
import { DefaultComponentProps } from './_default';
import { PageNames, useRouter } from '../router';

export const Link = defineComponent({
  props: {
    ...DefaultComponentProps,
    href: {
      type: String as PropType<PageNames>,
      required: true,
    },
  },
  setup(props, ctx) {
    const router = useRouter();

    return () => (
      <a
        id={props.id}
        class={props.class}
        style={props.style}
        href={props.href}
        onClick={(event) => {
          event.preventDefault();
          router.push(props.href);
        }}
      >
        {ctx.slots.default ? ctx.slots.default() : ''}
      </a>
    );
  },
});
