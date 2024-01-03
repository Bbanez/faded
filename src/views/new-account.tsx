import { defineComponent, ref } from 'vue';
import { Button, Input, Link } from '../components';
import { createRefValidator, createValidationItem } from '../util';
import { AccountFactory, useDb } from '../db';
import { useRoute } from '../router';

export const NewAccountView = defineComponent({
  setup() {
    const db = useDb();
    const route = useRoute();
    const data = ref({
      username: createValidationItem({
        value: '',
        handler(value) {
          if (!value) {
            return 'Please enter username';
          }
          const account = db.accounts.methods.findByUsername(value);
          if (account) {
            return 'You already have account with this username';
          }
        },
      }),
    });
    const validate = createRefValidator(data);

    async function submit() {
      if (!validate()) {
        return;
      }
      const account = AccountFactory.create({
        level: 1,
        username: data.value.username.value,
      });
      await db.accounts.set(account);
      route.push('account');
    }

    return () => (
      <div class="relative">
        <div class="absolute top-0 left-0 w-full h-screen flex flex-col items-center">
          <div class="m-auto">
            <Input
              label="Username"
              error={data.value.username.error}
              value={data.value.username.value}
              onInput={(value) => {
                data.value.username.value = value;
              }}
            />
            <Button
              onClick={() => {
                submit();
              }}
            >
              Create
            </Button>
          </div>
        </div>
        <div class="relative">
          <Link href="home">Back</Link>
        </div>
      </div>
    );
  },
});
