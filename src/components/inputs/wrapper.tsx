import { defineComponent } from 'vue';
import { DefaultComponentProps, PropStringOrJsx } from '../_default';
import { Icon } from '@fdd/components/icon.tsx';

export const InputWrapperProps = {
    ...DefaultComponentProps,
    label: String,
    description: PropStringOrJsx,
    error: PropStringOrJsx,
};

export const InputWrapper = defineComponent({
    props: {
        ...InputWrapperProps,
    },
    setup(props, ctx) {
        return () => (
            <label
                class={`flex flex-col w-full ${props.class}`}
                style={props.style}
                for={props.label || props.id}
            >
                {props.label || props.error ? (
                    <div
                        class={`flex flex-col gap-2 mb-1 ${
                            props.error ? 'text-red-500' : ''
                        }`}
                    >
                        {props.label && (
                            <div class="uppercase text-xs">{props.label}</div>
                        )}
                        {props.error && (
                            <div class={`flex gap-2 text-xs`}>
                                <Icon
                                    src={`/feather/alert-circle`}
                                    class="w-4 h-4"
                                />
                                <div>
                                    {typeof props.error === 'function'
                                        ? props.error()
                                        : props.error}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    ''
                )}
                <div class="text-black">
                    {ctx.slots.default ? ctx.slots.default() : ''}
                </div>
                {props.description && (
                    <div class="text-xs text-gray-500 font-light mt-1">
                        {typeof props.description === 'function'
                            ? props.description()
                            : props.description}
                    </div>
                )}
            </label>
        );
    },
});
