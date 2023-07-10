import { Icon } from '@ui/component';
import { LoginLayout } from '@ui/layout';
import { computed, defineComponent, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Buffer } from 'buffer';
import { throwable } from '@ui/util';
import { useApi } from '@ui/api';

const component = defineComponent({
  setup() {
    const route = useRoute();
    const router = useRouter();
    const api = useApi();

    const query = computed(() => {
      let d: any = {};
      try {
        d = JSON.parse(Buffer.from(route.query.d + '', 'hex').toString());
      } catch (error) {
        console.error(error);
      }
      return {
        type: route.query.type,
        data: d,
        forward: route.query.forward as string,
      };
    });

    onMounted(async () => {
      if (await api.isLoggedIn()) {
        await router.push(
          query.value.forward ? query.value.forward : '/dashboard',
        );
      }
      if (
        query.value.type === 'lo' &&
        query.value.data &&
        query.value.data.userId &&
        query.value.data.otp
      ) {
        await throwable(
          async () => {
            await api.auth.login({
              otp: query.value.data.otp,
              userId: query.value.data.userId,
            });
          },
          async () => {
            await router.push('/dashboard');
          },
        );
      }
    });

    return () => (
      <LoginLayout title="Login" class="login">
        <a class="login--link" href="/api/v1/auth/redirect/google">
          <Icon src="/google" />
          <span>Google</span>
        </a>
        <a class="login--link" href="/api/v1/auth/redirect/github">
          <Icon src="/github" />
          <span>Github</span>
        </a>
      </LoginLayout>
    );
  },
});
export default component;
