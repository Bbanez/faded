import { defineComponent, onMounted, ref } from 'vue';
import { getModalDefaultProps } from '../_wrapper';
import { createRefValidator, createValidationItem } from '@fdd/util/validation';

export const ModalConfirm = defineComponent({
    props: getModalDefaultProps<void, void>(),
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
                    value: 50,
                }),
            };
        }

        onMounted(() => {
            const handler = props.handler;
            handler._onOpen = (event) => {
                if (event?.data) {
                    data.value = event.data;
                    inputs.value.prompt.value = '';
                }
            };
            handler._onDone = async () => {
                return [inputsValid(), undefined];
            };
            handler._onCancel = async () => {
                return true;
            };
        });

        return () => (
            <ModalWrapper
                title={data.value.title}
                handler={props.handler}
                doneText={'Confirm'}
            >
                <div>
                    <div>{data.value.content}</div>
                    {data.value.prompt && (
                        <TextInput
                            id={`confirm_prompt`}
                            value={inputs.value.prompt.value}
                            error={inputs.value.prompt.error}
                            placeholder={data.value.prompt}
                            description={() => (
                                <p>
                                    Please type{' '}
                                    <strong>{data.value.prompt}</strong> to
                                    confirm
                                </p>
                            )}
                            onInput={(value) => {
                                inputs.value.prompt.value = value;
                            }}
                        />
                    )}
                </div>
            </ModalWrapper>
        );
    },
});
