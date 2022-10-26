import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';
import { DefaultComponentProps } from './default-props';

export const Link = defineComponent({
  props: {
    ...DefaultComponentProps,
    href: {
      type: String,
      required: true,
    },
    customOnClick: Boolean,
  },
  emits: {
    click: (_event: MouseEvent) => true,
  },
  setup(props, ctx) {
    const router = useRouter();

    return () => (
      <a
        {...props}
        onClick={(event) => {
          if (props.customOnClick) {
            ctx.emit('click', event);
          } else {
            event.preventDefault();
            if (!props.href.startsWith('http')) {
              router.push(props.href);
            }
          }
        }}
      >
        {ctx.slots.default ? ctx.slots.default() : ''}
      </a>
    );
  },
});
