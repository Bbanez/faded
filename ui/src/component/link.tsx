import { defineComponent, PropType } from 'vue';
import { useRouter } from 'vue-router';
import { DefaultComponentProps } from './default-props';

export const Link = defineComponent({
  props: {
    ...DefaultComponentProps,
    href: {
      type: String,
      required: true,
    },
    onClick: Function as PropType<(event: Event) => void | Promise<void>>,
  },
  setup(props, ctx) {
    const router = useRouter();

    return () => (
      <a
        id={props.id}
        style={props.style}
        class={`link ${props.class || ''}`}
        href={props.href}
        onClick={(event) => {
          if (
            props.href.startsWith('http') ||
            props.href.startsWith('mailto')
          ) {
            if (props.onClick) {
              props.onClick(event);
              return;
            }
          }
          event.preventDefault();
          if (props.onClick) {
            props.onClick(event);
          } else {
            router.push(props.href);
          }
        }}
      >
        {ctx.slots.default ? ctx.slots.default() : ''}
      </a>
    );
  },
});
