import { defineComponent, onMounted, ref } from 'vue';
import { ModalWrapper, getModalDefaultProps } from '../_wrapper';
import { createRefValidator, createValidationItem } from '@fdd/util/validation';
import { TextInput } from '@fdd/components/inputs/text';

export interface ModalLanscapeCreateOutput {
    name: string;
    width: number;
    depth: number;
    height: number;
}

export const ModalLandscapeCreate = defineComponent({
    props: getModalDefaultProps<void, ModalLanscapeCreateOutput>(),
    setup(props) {
        const inputs = ref(getInputs());
        const inputsValid = createRefValidator(inputs);

        function getInputs() {
            return {
                name: createValidationItem({
                    value: '',
                    handler(value) {
                        if (!value) {
                            return 'Please enter a map name';
                        }
                    },
                }),
                width: createValidationItem({
                    value: '50',
                    handler(value) {
                        const num = parseInt(value);
                        if (isNaN(num) || num < 1 || num > 1023) {
                            return 'Width must be between 1 and 1023';
                        }
                    },
                }),
                depth: createValidationItem({
                    value: '50',
                    handler(value) {
                        const num = parseInt(value);
                        if (isNaN(num) || num < 1 || num > 1023) {
                            return 'Depth must be between 1 and 1023';
                        }
                    },
                }),
                height: createValidationItem({
                    value: '5',
                    handler(value) {
                        const num = parseInt(value);
                        if (isNaN(num) || num < 1 || num > 1023) {
                            return 'Height must be between 1 and 1023';
                        }
                    },
                }),
            };
        }

        onMounted(() => {
            const handler = props.handler;
            handler._onOpen = () => {
                inputs.value = getInputs();
            };
            handler._onDone = async () => {
                return [
                    inputsValid(),
                    {
                        depth: parseInt(inputs.value.depth.value),
                        height: parseInt(inputs.value.height.value),
                        width: parseInt(inputs.value.width.value),
                        name: inputs.value.name.value,
                    },
                ];
            };
            handler._onCancel = async () => {
                return true;
            };
        });

        return () => (
            <ModalWrapper
                title={'Create map'}
                handler={props.handler}
                doneText={'Create'}
            >
                <div class={`flex flex-col gap-4`}>
                    <TextInput
                        label="Name"
                        placeholder="Map name"
                        value={inputs.value.name.value}
                        error={inputs.value.name.error}
                        onInput={(value) => {
                            inputs.value.name.value = value;
                        }}
                    />
                    <TextInput
                        label="Width"
                        placeholder="Map width"
                        type="number"
                        value={inputs.value.width.value}
                        error={inputs.value.width.error}
                        description={`Value must be a number between 1 and 1023`}
                        onInput={(value, event) => {
                            const val = value.replace(/[^0-9]/g, '');
                            if (event) {
                                const el = event.target as HTMLInputElement;
                                el.value = val;
                            }
                            inputs.value.width.value = val;
                        }}
                    />
                    <TextInput
                        label="Depth"
                        placeholder="Map depth"
                        type="number"
                        value={inputs.value.depth.value}
                        error={inputs.value.depth.error}
                        description={`Value must be a number between 1 and 1023`}
                        onInput={(value, event) => {
                            const val = value.replace(/[^0-9]/g, '');
                            if (event) {
                                const el = event.target as HTMLInputElement;
                                el.value = val;
                            }
                            inputs.value.depth.value = val;
                        }}
                    />
                    <TextInput
                        label="Height"
                        placeholder="Map height"
                        type="number"
                        value={inputs.value.height.value}
                        error={inputs.value.height.error}
                        description={`Value must be a number between 1 and 1023`}
                        onInput={(value, event) => {
                            const val = value.replace(/[^0-9]/g, '');
                            if (event) {
                                const el = event.target as HTMLInputElement;
                                el.value = val;
                            }
                            inputs.value.height.value = val;
                        }}
                    />
                </div>
            </ModalWrapper>
        );
    },
});
