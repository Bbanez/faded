import { defineComponent } from 'vue';
import { AuthLayout } from '../components';

export default defineComponent({
  setup() {
    return () => (
      <AuthLayout>
        <h1>404</h1>
      </AuthLayout>
    );
  },
});
