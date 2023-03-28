import {
  Button,
  Icon,
  NormalLayout,
  PasswordInput,
  TextInput,
} from '@client/components';
import { SDK } from '@client/sdk';
import { isEmailValid, throwable } from '@client/util';
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  setup() {
    const submitting = ref(false);
    const verifyEmail = ref(false);
    const router = useRouter();
    const data = ref({
      email: {
        value: '',
        err: '',
      },
      username: {
        value: '',
        err: '',
      },
      pass: {
        value: '',
        err: '',
      },
    });

    async function submit(event: Event) {
      submitting.value = true;
      event.preventDefault();
      event.stopPropagation();
      let errors = false;
      if (!isEmailValid(data.value.email.value)) {
        data.value.email.err = 'Please enter a valid email';
        errors = true;
      } else {
        data.value.email.err = '';
      }
      if (data.value.pass.value.trim().replace(/ /g, '') === '') {
        data.value.pass.err = 'Please enter a password';
        errors = true;
      } else {
        data.value.pass.err = '';
      }
      if (data.value.username.value.trim().replace(/ /g, '') === '') {
        data.value.username.err = 'Please enter a username';
        errors = true;
      } else {
        data.value.username.err = '';
      }
      if (errors) {
        submitting.value = false;
        return;
      }
      const usernameAvailable = await SDK.user.isUsernameAvailable(
        data.value.username.value,
      );
      if (!usernameAvailable) {
        data.value.username.err = `Username "${data.value.username.value}" is taken`;
        submitting.value = false;
        return;
      }
      await throwable(
        async () => {
          await SDK.user.signup({
            firstName: '',
            lastName: '',
            username: data.value.username.value,
            email: data.value.email.value,
            password: data.value.pass.value,
          });
        },
        async () => {
          verifyEmail.value = true;
        },
      );
      submitting.value = false;
    }

    return () => (
      <NormalLayout>
        <div class="login">
          {verifyEmail.value ? (
            <>
              <h1>We've sent you an email</h1>
              <p style="margin-top: 40px">
                Please go to your email account and follow the instructions.
              </p>
            </>
          ) : (
            <>
              <h1>Create an account</h1>
              <div class="login--form">
                <TextInput
                  label="Username"
                  placeholder="Username"
                  value={data.value.username.value}
                  errorText={data.value.username.err}
                  onInput={(value) => {
                    data.value.username.value = value
                      .replace(/ /g, '')
                      .replace(/[^a-zA-Z0-9]+/g, '');
                  }}
                />
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
                <Button onClick={submit} disabled={submitting.value}>
                  Sign up
                </Button>
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
                  <span class="text">Sign up with Google</span>
                  <Icon class="icon" src="/google" />
                </button>
                <button class="login--social-item">
                  <span class="text">Sign up with Github</span>
                  <Icon class="icon" src="/github" />
                </button>
              </div>
              <div class="login--additional">
                <div class="text">Already have an account?</div>
                <Button
                  onClick={() => {
                    router.push('/');
                  }}
                >
                  Log in
                </Button>
              </div>
            </>
          )}
        </div>
      </NormalLayout>
    );
  },
});
