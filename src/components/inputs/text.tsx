import { defineComponent, onMounted, ref } from 'vue';
import clsx from 'clsx';
import {
    InputWrapper,
    InputWrapperProps,
} from '@fdd/components/inputs/wrapper.tsx';

export const TextInput = defineComponent({
    props: {
        ...InputWrapperProps,
        value: String,
        focus: Boolean,
        type: String,
        disabled: Boolean,
        placeholder: String,
        readOnly: Boolean,
    },
    emits: {
        input: (_value: string, _event?: Event) => {
            return true;
        },
        enter: (_event: Event) => {
            return true;
        },
        blur: (_event: Event) => {
            return true;
        },
    },
    setup(props, ctx) {
        const inputRef = ref<HTMLInputElement | null>(null);

        function handleInput(event: Event) {
            const element = event.target as HTMLInputElement;
            if (!element) {
                return;
            }
            ctx.emit('input', element.value, event);
        }

        onMounted(() => {
            if (props.focus) {
                inputRef.value?.focus();
            }
        });

        return () => (
            <InputWrapper
                id={props.id}
                style={props.style}
                class={props.class}
                label={props.label}
                error={props.error}
                description={props.description}
            >
                <input
                    ref={inputRef}
                    type={props.type}
                    id={
                        props.id
                            ? props.id
                            : typeof props.label === 'string'
                              ? props.label
                              : ''
                    }
                    class={clsx()}
                    placeholder={props.placeholder}
                    value={props.value}
                    disabled={props.disabled}
                    readonly={props.readOnly}
                    onInput={handleInput}
                    onChange={handleInput}
                    onKeyup={(event) => {
                        if (event.key === 'Enter') {
                            ctx.emit('enter', event);
                        }
                    }}
                    onBlur={(event) => {
                        ctx.emit('blur', event);
                    }}
                />
            </InputWrapper>
        );
    },
});
