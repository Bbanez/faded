import { useApi } from '@ui/api';
import { Button, TextInput } from '@ui/component';
import { createRefValidator, createValidationItem, throwable } from '@ui/util';
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  setup() {
    const api = useApi();
    const router = useRouter();
    const data = ref({
      username: createValidationItem({
        value: '',
        handler(value) {
          if (!value) {
            return 'Please enter a username.';
          }
        },
      }),
    });
    const validator = createRefValidator(data);

    async function submit() {
      if (!validator()) {
        return;
      }
      await throwable(
        async () => {
          await api.user.update({
            username: data.value.username.value,
          });
        },
        async () => {
          await router.push('/dashboard');
        },
      );
    }

    return () => (
      <div class="setup">
        <div class="setup--wrapper">
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              await submit();
            }}
          >
            <h1>Setup</h1>
            <TextInput
              label="Username"
              placeholder="Enter your username"
              helperText="Username can only container lower letters and numbers. Please make sure that name is appropriate."
              invalidText={data.value.username.error}
              value={data.value.username.value}
              onInput={(value, event) => {
                const result = value.replace(/[^a-z0-9]/g, '');
                (event.target as HTMLInputElement).value = result;
                data.value.username.value = result;
              }}
            />
            <Button>Continue</Button>
          </form>
        </div>
      </div>
    );
  },
});
