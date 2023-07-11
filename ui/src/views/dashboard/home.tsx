import { UserPublic } from '@backend/user';
import { useApi } from '@ui/api';
import { Avatar, Icon, Link } from '@ui/component';
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
      if (me.value && me.value.friends && me.value.friends.length > 0) {
        return store.user.findManyById(me.value.friends);
      }
      return [];
    });
    const invitations = computed(() => store.userInvitation.items());
    const userInvitations = computed(() => {
      const users: Array<UserPublic & { type: 'sent' | 'received' }> = [];
      if (me.value) {
        for (let i = 0; i < invitations.value.length; i++) {
          const invitation = invitations.value[i];
          const user = store.user.findById(
            invitation.from !== me.value._id ? invitation.from : invitation.to,
          );
          if (user) {
            users.push({
              ...user,
              type: invitation.from !== me.value._id ? 'received' : 'sent',
            });
          }
        }
      }
      return users;
    });

    onMounted(async () => {
      await throwable(async () => {
        const user = await api.user.get();
        await api.user.getFriends();
        const invs = await api.userInvitation.getAll();
        if (invs.length > 0) {
          await api.user.getMany(
            invs.map((inv) => {
              return inv.from === user._id ? inv.to : inv.from;
            }),
          );
        }
      });
    });

    return () => (
      <Layout title="Home">
        <div class="home">
          <div class="home--section">
            <h2 class="home--section-title">
              <span class="home--section-name">Friends</span>
              <button
                onClick={() => {
                  ModalService.userSearch.show({ title: 'Find friends' });
                }}
              >
                <Icon src="/feather/plus" />
              </button>
            </h2>
            <div class="home--friends">
              {friends.value.length > 0 || userInvitations.value.length > 0 ? (
                <>
                  {friends.value.map((user) => {
                    return (
                      <Link
                        class="home--friend"
                        href={`/dashboard/user/${user.username}`}
                      >
                        <Avatar user={user} />
                        <div>{user.username}</div>
                      </Link>
                    );
                  })}
                  {userInvitations.value.map((user) => {
                    return (
                      <div
                        class={`home--friend user--friend-invitation_${user.type}`}
                      >
                        <Avatar user={user} />
                        <div>{user.username}</div>
                        {user.type === 'sent' ? (
                          <Icon
                            src="/feather/info"
                            title="Invitation has been sent to a user"
                          />
                        ) : (
                          <button
                            onClick={async () => {
                              await throwable(async () => {
                                const inv = invitations.value.find(
                                  (e) => e.from === user._id,
                                );
                                await api.userInvitation.accept({
                                  invitationId: inv?._id || '__none',
                                });
                                await api.user.getFriends();
                              });
                            }}
                          >
                            <Icon src="/feather/check-circle" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </>
              ) : (
                <div class="home--section-empty">
                  You do not have any friends yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    );
  },
});
