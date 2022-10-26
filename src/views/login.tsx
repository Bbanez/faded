import { defineComponent, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  AuthLayout,
  Button,
  Link,
  PasswordInput,
  TextInput,
} from '../components';
import { useSdk } from '../sdk';
import { emailValidation, throwable } from '../util';

export default defineComponent({
  setup() {
    const sdk = useSdk();
    const router = useRouter();
    const data = ref({
      email: {
        value: '',
        err: '',
      },
      pass: {
        value: '',
        err: '',
      },
    });

    async function submit() {
      if (!emailValidation(data.value.email.value)) {
        data.value.email.err = 'Invalid email';
        return;
      } else {
        data.value.email.err = '';
      }
      if (data.value.pass.value.replace(/ /g, '').length === 0) {
        data.value.pass.err = 'Please enter your password';
      } else {
        data.value.pass.err = '';
      }
      await throwable(
        async () => {
          await sdk.user.login({
            email: data.value.email.value,
            password: data.value.pass.value,
          });
        },
        async () => {
          await router.push('/game');
        },
      );
    }

    onMounted(async () => {
      await throwable(
        async () => {
          return await sdk.isLoggedIn();
        },
        async (result) => {
          if (result) {
            await router.push('/game');
          }
        },
      );
    });

    return () => (
      <AuthLayout title="Log in">
        <TextInput
          label="Email"
          placeholder="Email"
          v-model={data.value.email.value}
          error={data.value.email.err}
        />
        <div style="height: 50px;"></div>
        <PasswordInput
          label="Password"
          placeholder="Password"
          v-model={data.value.pass.value}
          error={data.value.pass.err}
          onEnter={() => {
            submit();
          }}
        />
        <Button
          onClick={() => {
            submit();
          }}
        >
          Log in
        </Button>
        <div class="authLayout--footer">
          <Link href="/sign-up">Do not have an account?</Link>
        </div>
      </AuthLayout>
    );
  },
});
