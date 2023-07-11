import { UserPublic } from '@backend/user';
import { useApi } from '@ui/api';
import { Avatar } from '@ui/component';
import { Layout } from '@ui/layout';
import { throwable } from '@ui/util';
import { defineComponent, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

export default defineComponent({
  setup() {
    const api = useApi();
    const route = useRoute();
    const user = ref<UserPublic | null>(null);

    onMounted(async () => {
      await throwable(
        async () => {
          return await api.user.getByUsername('' + route.params.username);
        },
        async (result) => {
          user.value = result;
        },
      );
    });

    return () => (
      <Layout title={user.value ? user.value.username : 'User profile'}>
        {user.value && (
          <div class="user">
            <div class="user--left">
              <Avatar class="user--left-avatar" user={user.value} />
            </div>
            <div class="user--right"></div>
          </div>
        )}
      </Layout>
    );
  },
});
