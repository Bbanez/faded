import { computed, defineComponent, onBeforeUnmount, onMounted } from 'vue';
import { InputWrapper, InputWrapperProps } from './wrapper.tsx';
import { Linear2D, createLinear2D } from '@fdd/util/math.ts';

export const SliderInput = defineComponent({
    props: {
        ...InputWrapperProps,
        value: {
            type: Number,
            required: true,
        },
        min: {
            type: Number,
            required: true,
        },
        max: {
            type: Number,
            required: true,
        },
    },
    emits: {
        input: (_value: number) => true,
    },
    setup(props, ctx) {
        let changeValue = false;
        let bBox: DOMRect | null = null;
        let mousePositionToValue: Linear2D | null = null;
        const toPercent = computed(() =>
            createLinear2D([props.min, 0], [props.max, 100]),
        );

        function onMouseUp() {
            changeValue = false;
            bBox = null;
            mousePositionToValue = null;
        }

        function onMouseMove(event: MouseEvent) {
            if (changeValue && mousePositionToValue) {
                let value = mousePositionToValue.call(event.clientX);
                if (value < props.min) {
                    value = props.min;
                } else if (value > props.max) {
                    value = props.max;
                }
                ctx.emit('input', value);
            }
        }

        function onMouseDown(event: MouseEvent) {
            const target = event.currentTarget as HTMLElement;
            if (target && target.parentElement) {
                changeValue = true;
                bBox = target.parentElement.getBoundingClientRect();
                mousePositionToValue = createLinear2D(
                    [bBox.left, props.min],
                    [bBox.right, props.max],
                );
                onMouseMove(event);
            }
        }

        onMounted(() => {
            window.addEventListener('mouseup', onMouseUp);
            window.addEventListener('mousemove', onMouseMove);
        });

        onBeforeUnmount(() => {
            window.removeEventListener('mouseup', onMouseUp);
            window.removeEventListener('mousemove', onMouseMove);
        });

        return () => (
            <InputWrapper {...props}>
                <button
                    id={props.id}
                    style={props.style}
                    class={`relative h-4 w-full flex items-center ${props.class}`}
                    onMousedown={onMouseDown}
                >
                    <div class={`h-1 w-full bg-red-500`}></div>
                    <button
                        onMousedown={onMouseDown}
                        class={`absolute w-2 h-full bg-gray-500`}
                        style={`left: ${toPercent.value.call(props.value)}%;`}
                    ></button>
                </button>
            </InputWrapper>
        );
    },
});
