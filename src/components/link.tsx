import { defineComponent, PropType } from 'vue';
import { DefaultComponentProps } from './_default';
import { buttonStyle } from './button.tsx';
import { useRouter } from 'vue-router';

export const Link = defineComponent({
    props: {
        ...DefaultComponentProps,
        asButton: String as PropType<keyof typeof buttonStyle>,
        href: {
            type: String,
            required: true,
        },
    },
    setup(props, ctx) {
        const router = useRouter();

        return () => (
            <a
                id={props.id}
                class={`${
                    props.asButton ? buttonStyle[props.asButton].class : ''
                } ${props.class || ''}`}
                style={props.style}
                href={props.href}
                onClick={async (event) => {
                    event.preventDefault();
                    await router.push(props.href);
                }}
            >
                {ctx.slots.default ? ctx.slots.default() : ''}
            </a>
        );
    },
});
