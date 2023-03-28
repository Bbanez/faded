import { NormalLayout } from '@client/components';
import { ToastService } from '@client/services';
import { defineComponent, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Buffer } from 'buffer';
import { SDK } from '@client/sdk';

export default defineComponent({
  setup() {
    const router = useRouter();
    const route = useRoute();

    onMounted(async () => {
      try {
        const query = route.query as { d: string };
        const data: {
          userId: string;
          otp: string;
        } = JSON.parse(Buffer.from(query.d, 'hex').toString());
        await SDK.user.signupComplete({
          userId: data.userId,
          otp: data.otp,
        });
        ToastService.emit(
          'info',
          'Your account has been verified. You can not login.',
        );
        await router.replace('/');
      } catch (error) {
        ToastService.emit('warning', 'Invalid sign up parameter');
      }
    });

    return () => (
      <NormalLayout>
        <div class="login">
          <h1>Please wait ...</h1>
        </div>
      </NormalLayout>
    );
  },
});
