import { defineComponent, ref } from 'vue';
import { SetupLayout } from '../layout';
import { SettingsHandler } from '../rust/settings.ts';
import { useSettings } from '../hooks/settings.ts';
import { Button } from '../components/button.tsx';
import { Link } from '../components/link.tsx';
import { Select, SelectOption } from '../components/inputs/select.tsx';
import { FunctionBuilder } from '../game/math';

export const Settings = defineComponent({
  setup() {
    const [settings] = useSettings();
    const inputs = ref({
      width: settings.value?.resolution[0] || window.innerWidth,
      height: settings.value?.resolution[1] || window.innerHeight,
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
      <SetupLayout>
        <div class={'flex flex-col gap-4'}>
          {settings.value ? (
            <>
              {/*<Input*/}
              {/*  type={'text'}*/}
              {/*  format={inputAsNumber('int')}*/}
              {/*  value={settings.value?.resolution[0] + ''}*/}
              {/*  onInput={(value) => {*/}
              {/*    if (settings.value) {*/}
              {/*      settings.value.resolution[0] = parseInt(value);*/}
              {/*    }*/}
              {/*  }}*/}
              {/*/>*/}
              {/*<Input*/}
              {/*  type={'text'}*/}
              {/*  format={inputAsNumber('int')}*/}
              {/*  value={settings.value?.resolution[1] + ''}*/}
              {/*  onInput={(value) => {*/}
              {/*    if (settings.value) {*/}
              {/*      settings.value.resolution[1] = parseInt(value);*/}
              {/*    }*/}
              {/*  }}*/}
              {/*/>*/}
              <Select
                value={inputs.value.width + 'x' + inputs.value.height}
                options={resOptions}
                onInput={(option) => {
                  const split = option.value.split('x');
                  if (settings.value) {
                    settings.value.resolution = [
                      parseInt(split[0]),
                      parseInt(split[1]),
                    ];
                    console.log(settings.value?.resolution)
                  }
                }}
              />
              <Button
                onClick={async () => {
                  if (settings.value) {
                    await SettingsHandler.set(settings.value?.resolution);
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
