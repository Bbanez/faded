import { defineComponent, PropType } from 'vue';
import { DefaultComponentProps } from './_default';
import { PageNames, useRouter } from '../router';
import { buttonStyle } from './button.tsx';

export const Link = defineComponent({
  props: {
    ...DefaultComponentProps,
    asButton: String as PropType<keyof typeof buttonStyle>,
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
        class={`${props.asButton ? buttonStyle[props.asButton].class : ''} ${props.class || ''}`}
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
