import { defineComponent, onMounted, ref } from 'vue';
import { Button } from '../components/button.tsx';
import { Link } from '../components/link.tsx';
import { Select, SelectOption } from '../components/inputs/select.tsx';
import { FunctionBuilder } from '../game/math/function-builder.ts';
import { throwable } from '../util/throwable.ts';
import { useSdk } from '../sdk/main.ts';
import { Settings } from '../types/rs';

export const SettingsView = defineComponent({
    setup() {
        const sdk = useSdk();
        const resOptions = getResolutions();
        const inputs = ref(getInputs());

        function getInputs(settings?: Settings) {
            return {
                width: settings?.resolution.width || window.innerWidth,
                height: settings?.resolution.height || window.innerHeight,
            };
        }

        function getResolutions() {
            const aspect = window.innerWidth / window.innerHeight;
            const options: SelectOption[] = [];
            const resFn = FunctionBuilder.linear2D([
                [0, 50],
                [9, window.innerWidth],
            ]);
            for (let i = 0; i < 10; i++) {
                const width = parseInt(resFn(i).toFixed(0));
                const height = parseInt((width / aspect).toFixed(0));
                options.push({
                    label: width + 'x' + height,
                    value: width + 'x' + height,
                });
            }
            return options.reverse();
        }

        onMounted(async () => {
            await throwable(
                async () => {
                    return await sdk.settings.get({
                        width: window.innerWidth,
                        height: window.innerHeight,
                    });
                },
                async (sett) => {
                    inputs.value = getInputs(sett);
                },
            );
        });

        return () => (
            <div class={'flex flex-col gap-4'}>
                <Select
                    value={inputs.value.width + 'x' + inputs.value.height}
                    options={resOptions}
                    onInput={(option) => {
                        const split = option.value.split('x');
                        inputs.value.width = parseInt(split[0]);
                        inputs.value.height = parseInt(split[1]);
                    }}
                />
                <Button
                    onClick={async () => {
                        await throwable(async () => {
                            await sdk.settings.set({
                                width: inputs.value.width,
                                height: inputs.value.height,
                            });
                        });
                    }}
                >
                    Update
                </Button>
                <Link href={'home'} asButton={'primary'}>
                    Back
                </Link>
            </div>
        );
    },
});
