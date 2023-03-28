import {
  Button,
  Icon,
  NormalLayout,
  PasswordInput,
  TextInput,
} from '@client/components';
import { SDK } from '@client/sdk';
import { throwable } from '@client/util';
import { defineComponent, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  setup() {
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

    async function submit(event: Event) {
      event.preventDefault();
      event.stopPropagation();
      await throwable(
        async () => {
          await SDK.user.login({
            email: data.value.email.value,
            password: data.value.pass.value,
          });
        },
        async () => {
          router.push('/game');
        },
      );
    }

    onMounted(async () => {
      await throwable(
        async () => {
          return await SDK.isLoggedIn();
        },
        async () => {
          router.push('/game');
        },
      );
    });

    return () => (
      <NormalLayout>
        <div class="login">
          <h1>Login to your account</h1>
          <div class="login--form">
            <TextInput
              label="Email"
              placeholder="Email"
              value={data.value.email.value}
              errorText={data.value.email.err}
              onInput={(value) => {
                data.value.email.value = value;
              }}
            />
            <PasswordInput
              label="Password"
              placeholder="Password"
              value={data.value.pass.value}
              errorText={data.value.pass.err}
              onInput={(value) => {
                data.value.pass.value = value;
              }}
            />
            <Button onClick={submit}>Login</Button>
          </div>
          <div class="login--or">
            <span class="line">
              <span />
            </span>
            <span class="text">OR</span>
            <span class="line">
              <span />
            </span>
          </div>
          <div class="login--social">
            <button class="login--social-item">
              <span class="text">Login with Google</span>
              <Icon class="icon" src="/google" />
            </button>
            <button class="login--social-item">
              <span class="text">Login with Github</span>
              <Icon class="icon" src="/github" />
            </button>
          </div>
          <div class="login--additional">
            <div class="text">Do not have an account?</div>
            <Button
              onClick={() => {
                router.push('/sign-up');
              }}
            >
              Sign up
            </Button>
          </div>
        </div>
      </NormalLayout>
    );
  },
});
