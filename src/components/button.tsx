import { defineComponent, PropType, reactive } from 'vue';
import { DefaultComponentProps } from './default-props';

export const Button = defineComponent({
  props: {
    ...DefaultComponentProps,
    kind: {
      type: String as PropType<
        'primary' | 'secondary' | 'alternate' | 'ghost' | 'danger'
      >,
      default: 'primary',
    },
    disabled: Boolean,
    size: String as PropType<'m' | 's'>,
    href: String,
    target: String,
  },
  emits: {
    click: (_: MouseEvent) => {
      return true;
    },
  },
  setup(props, ctx) {
    props = reactive(props);

    const Tag = props.href ? 'a' : 'button';

    return () => {
      return (
        <Tag
          class={`button button_${props.kind} ${
            props.class ? props.class : ''
          }`}
          style={props.style}
          disabled={props.disabled}
          onClick={(event) => {
            ctx.emit('click', event);
          }}
          href={props.href ? props.href : undefined}
          target={props.target || '_blank'}
        >
          {ctx.slots.default ? (
            <span class="button--content">{ctx.slots.default()}</span>
          ) : (
            ''
          )}
        </Tag>
      );
    };
  },
});
