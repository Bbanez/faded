import { defineComponent, ref } from 'vue';
import { SetupLayout } from '../layout';
import { FunctionBuilder } from '../game/math';
import { useSettings } from '../hooks/settings';
import { Select, SelectOption } from '../components/inputs/select';
import { Button } from '../components/button';
import { SettingsSet } from '../../wailsjs/go/game/Api';
import { Link } from '../components/link';

export const Settings = defineComponent({
    setup() {
        const settingsQuery = useSettings();
        const aspectRatio = window.innerWidth / window.innerHeight;
        const inputs = ref({
            width: settingsQuery.data.value?.resolution.width || window.innerWidth,
            height: settingsQuery.data.value?.resolution
                ? settingsQuery.data.value.resolution.width / aspectRatio
                : window.innerHeight,
        });
        const resOptions = getResolutions();

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

        return () => (
            <SetupLayout
                navItems={[
                    {
                        class: 'mt-auto',
                        text: 'Back',
                        href: 'home',
                    },
                ]}
            >
                <div class={'flex flex-col gap-4'}>
                    {settingsQuery.data.value ? (
                        <>
                            <Select
                                value={inputs.value.width + 'x' + inputs.value.height}
                                options={resOptions}
                                onInput={(option) => {
                                    const split = option.value.split('x');
                                    if (settingsQuery.data.value) {
                                        settingsQuery.data.value.resolution.width = parseInt(
                                            split[0],
                                        );
                                    }
                                }}
                            />
                            <Button
                                onClick={async () => {
                                    if (settingsQuery.data.value) {
                                        settingsQuery.data.value = await SettingsSet(
                                            settingsQuery.data.value.resolution,
                                        );
                                    }
                                }}
                            >
                                Update
                            </Button>
                        </>
                    ) : (
                        'Loading ...'
                    )}
                    <Link href={'home'} asButton={'primary'}>
                        Back
                    </Link>
                </div>
            </SetupLayout>
        );
    },
});
