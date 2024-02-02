import { defineComponent } from 'vue';
import { SetupLayout } from '../layout';
import { SettingsHandler, useSettings } from '../rust/settings.ts';
import { Button, Input, inputAsNumber, Link } from '../components';

export const Settings = defineComponent({
  setup() {
    const settings = useSettings();
    return () => (
      <SetupLayout>
        <div class={'flex flex-col gap-4'}>
          {settings.data.value ? (
            <>
              <Input
                type={'text'}
                format={inputAsNumber('int')}
                value={settings.data.value?.resolution[0] + ''}
                onInput={(value) => {
                  if (settings.data.value) {
                    settings.data.value.resolution[0] = parseInt(value);
                  }
                }}
              />
              <Input
                type={'text'}
                format={inputAsNumber('int')}
                value={settings.data.value?.resolution[1] + ''}
                onInput={(value) => {
                  if (settings.data.value) {
                    settings.data.value.resolution[1] = parseInt(value);
                  }
                }}
              />
              <Button
                onClick={async () => {
                  if (settings.data.value) {
                    await SettingsHandler.set(settings.data.value?.resolution);
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
