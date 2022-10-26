import { defineComponent } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { AuthLayout } from '../components';
import { Buffer } from 'buffer';
import { throwable } from '../util';
import { useSdk } from '../sdk';
import { ToastService } from '../services';

export default defineComponent({
  setup() {
    const sdk = useSdk();
    const route = useRoute();
    const router = useRouter();

    function init() {
      const d = route.query.d as string;
      if (!d) {
        router.push('/');
      } else {
        try {
          const data = JSON.parse(Buffer.from(d, 'hex').toString());
          throwable(
            async () => {
              await sdk.user.signupComplete({
                userId: data.userId,
                otp: data.otp,
              });
            },
            async () => {
              ToastService.emit({
                type: 'success',
                content:
                  'Your account was successfully verified. You can now login.',
              });
              await router.push('/');
            },
          );
        } catch (error) {
          router.push('/');
        }
      }
    }
    init();

    return () => (
      <AuthLayout title="Account verification">
        Verifying account ...
      </AuthLayout>
    );
  },
});
