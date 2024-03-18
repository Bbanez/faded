import { PropType, defineComponent } from 'vue';
import { DefaultComponentProps } from './_default';

export type ButtonType = 'primary';

export const buttonStyle = {
    primary: {
        class: 'bg-slate-400 px-4 py-2 hover:bg-slate-600 transition-all',
    },
};

export const Button = defineComponent({
    props: {
        ...DefaultComponentProps,
        kind: {
            type: String as PropType<keyof typeof buttonStyle>,
            default: 'primary',
        },
    },
    emits: {
        click: (_event: Event) => {
            return true;
        },
    },
    setup(props, ctx) {
        return () => (
            <button
                id={props.id}
                class={`${
                    buttonStyle[props.kind]
                        ? buttonStyle[props.kind].class
                        : buttonStyle.primary.class
                } ${props.class || ''}`}
                style={props.style}
                onClick={(event) => {
                    ctx.emit('click', event);
                }}
            >
                {ctx.slots.default ? ctx.slots.default() : ''}
            </button>
        );
    },
});
