import { defineComponent, ref } from 'vue';
import {
  AuthLayout,
  Button,
  Link,
  PasswordInput,
  TextInput,
} from '../components';
import { useSdk } from '../sdk';
import { emailValidation, throwable } from '../util';
import PasswordValidator from 'password-validator';
import { ToastService } from '../services';

export default defineComponent({
  setup() {
    const passwordValidator = new PasswordValidator();
    const password = passwordValidator
      .is()
      .min(8)
      .has()
      .uppercase()
      .has()
      .lowercase()
      .has()
      .digits()
      .has()
      .symbols()
      .is()
      .not()
      .oneOf([
        '123456',
        '123456789',
        'qwerty',
        'password',
        '1111111',
        '12345678',
        'abc123',
        '1234567',
        'password1',
        '12345',
        '1234567890',
        '123123',
        '000000',
        'Iloveyou',
        '1234',
        '1q2w3e4r5t',
        'Qwertyuiop',
        '123',
        'Monkey',
        'Dragon',
      ]);
    const submitted = ref(false);
    const sdk = useSdk();
    const data = ref({
      email: {
        value: '',
        err: '',
      },
      username: {
        value: '',
        err: '',
      },
      firstName: {
        value: '',
        err: '',
      },
      lastName: {
        value: '',
        err: '',
      },
      pass: {
        value: '',
        err: '',
      },
    });

    async function submit() {
      let errors = false;
      if (!emailValidation(data.value.email.value)) {
        data.value.email.err = 'Invalid email';
        errors = true;
      } else {
        data.value.email.err = '';
      }
      if (data.value.firstName.value.replace(/ /g, '').length === 0) {
        data.value.firstName.err = 'Please enter your first name';
        errors = true;
      } else {
        data.value.firstName.err = '';
      }
      if (data.value.lastName.value.replace(/ /g, '').length === 0) {
        data.value.lastName.err = 'Please enter your last name';
        errors = true;
      } else {
        data.value.lastName.err = '';
      }
      if (data.value.username.value.replace(/ /g, '').length === 0) {
        data.value.username.err = 'Please enter a username';
        errors = true;
      } else {
        if (!(await sdk.user.isUsernameAvailable(data.value.username.value))) {
          data.value.username.err = `Username "${data.value.username.value}" is already taken`;
          errors = true;
        } else {
          data.value.username.err = '';
        }
      }
      const passResult = password.validate(data.value.pass.value, {
        list: true,
      }) as string[];
      if (passResult.length !== 0) {
        data.value.pass.err = `You password isn't strong enough. It must contain at 
          least 8 characters with: digits, symbols, upper and 
          lower case characters.`;
        errors = true;
      } else {
        data.value.pass.err = '';
      }
      if (errors) {
        return;
      }
      throwable(
        async () => {
          return await sdk.user.signup({
            email: data.value.email.value,
            username: data.value.username.value,
            firstName: data.value.firstName.value,
            lastName: data.value.lastName.value,
            password: data.value.pass.value,
          });
        },
        async () => {
          ToastService.emit({
            type: 'success',
            content:
              'Request was successful. Please check your email for verification link.',
          });
          submitted.value = true;
        },
      );
    }

    return () => (
      <AuthLayout title="Sign up">
        {submitted.value ? (
          <p>Check your email for verification link.</p>
        ) : (
          <>
            <TextInput
              label="Username"
              placeholder="Username"
              v-model={data.value.username.value}
              error={data.value.username.err}
            />
            <TextInput
              label="First name"
              placeholder="First name"
              v-model={data.value.firstName.value}
              error={data.value.firstName.err}
            />
            <TextInput
              label="Last name"
              placeholder="Last name"
              v-model={data.value.lastName.value}
              error={data.value.lastName.err}
            />
            <TextInput
              label="Email"
              placeholder="Email"
              v-model={data.value.email.value}
              error={data.value.email.err}
            />
            <PasswordInput
              label="Password"
              placeholder="Password"
              v-model={data.value.pass.value}
              error={data.value.pass.err}
            />
            <Button onClick={submit}>Sign up</Button>
            <div class="authLayout--footer">
              <Link href="/">Already have an account?</Link>
            </div>
          </>
        )}
      </AuthLayout>
    );
  },
});
