import { useApi } from '@ui/api';
import { Avatar, Button, Link } from '@ui/component';
import { Layout } from '@ui/layout';
import { ModalService } from '@ui/service';
import { useStore } from '@ui/store';
import { throwable } from '@ui/util';
import { computed, defineComponent, onMounted } from 'vue';

export default defineComponent({
  setup() {
    const api = useApi();
    const store = useStore();
    const me = computed(() => store.user.methods.me());
    const friends = computed(() => {
      return store.user.findManyById(me.value?.friends || []);
    });

    onMounted(async () => {
      await throwable(async () => {
        await api.user.get();
        await api.user.getFriends();
      });
    });

    return () => (
      <Layout title="Home">
        <div class="home">
          <div class="home--section">
            <h2>Friends</h2>
            <div class="home--friends">
              {friends.value.length > 0 ? (
                friends.value.map((user) => {
                  return (
                    <Link
                      class="home--friend"
                      href={`/dashboard/user/${user.username}`}
                    >
                      <Avatar user={user} />
                    </Link>
                  );
                })
              ) : (
                <div class="home--section-empty">
                  You do not have any friends yet.
                </div>
              )}
              <Button
                onClick={() => {
                  ModalService.userSearch.show({ title: 'Find friends' });
                }}
              >
                Add a friend
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  },
});
