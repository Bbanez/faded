import { defineComponent } from 'vue';
import { DefaultComponentProps } from './_default.ts';
import { Icon } from './icon.tsx';

export const Loader = defineComponent({
    props: {
        ...DefaultComponentProps,
        show: { type: Boolean, default: true },
    },
    setup(props) {
        return () => (
            <>
                {props.show && (
                    <>
                        <Icon
                            id={props.id}
                            style={`animation-duration: 4s !important; ${props.style}`}
                            class={`animate-spin ${props.class}`}
                            src={'/loading-dark'}
                        />
                    </>
                )}
            </>
        );
    },
});

export const LoaderPage = defineComponent({
    props: {
        ...DefaultComponentProps,
        show: { type: Boolean, default: true },
    },
    setup(props, ctx) {
        return () => (
            <>
                {props.show && (
                    <div
                        id={props.id}
                        class={`fixed z-1000 top-0 left-0 w-full h-screen bg-white dark:bg-black flex flex-col gap-8 justify-center items-center ${
                            props.class || ''
                        }`}
                        style={props.style}
                    >
                        <Loader class={'w-12 h-12'} />
                        {ctx.slots.default?.()}
                    </div>
                )}
            </>
        );
    },
});
