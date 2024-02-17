import { defineComponent } from 'vue';
import { SetupLayout } from '../layout';
import { SettingsHandler } from '../rust/settings.ts';
import { Button, Input, inputAsNumber, Link } from '../components';
import { useSettings } from '../hooks/settings.ts';

export const Settings = defineComponent({
  setup() {
    const [settings] = useSettings();
    return () => (
      <SetupLayout>
        <div class={'flex flex-col gap-4'}>
          {settings.value ? (
            <>
              <Input
                type={'text'}
                format={inputAsNumber('int')}
                value={settings.value?.resolution[0] + ''}
                onInput={(value) => {
                  if (settings.value) {
                    settings.value.resolution[0] = parseInt(value);
                  }
                }}
              />
              <Input
                type={'text'}
                format={inputAsNumber('int')}
                value={settings.value?.resolution[1] + ''}
                onInput={(value) => {
                  if (settings.value) {
                    settings.value.resolution[1] = parseInt(value);
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
