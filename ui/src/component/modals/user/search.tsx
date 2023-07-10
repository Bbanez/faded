import { UserPublic } from '@backend/user';
import { useApi } from '@ui/api';
import { Avatar } from '@ui/component/avatar';
import { TextInput } from '@ui/component/input';
import { ModalInputDefaults, ModalService } from '@ui/service';
import { useStore } from '@ui/store';
import { throwable } from '@ui/util';
import { computed, defineComponent, ref } from 'vue';
import { createModalCancelFn, createModalDoneFn, Modal } from '../_wrapper';

export const ModalUserSearch = defineComponent({
  setup() {
    const api = useApi();
    const store = useStore();
    const me = computed(() => store.user.methods.me());
    const invitations = computed(() => store.userInvitation.items());
    const friends = computed(() =>
      store.user.findManyById(me.value?.friends || []),
    );
    const users = ref<UserPublic[]>([]);
    const data = ref<ModalInputDefaults<void>>({
      title: 'Find users',
    });
    const pageData = ref({
      username: '',
    });

    let timeout: NodeJS.Timeout;
    let done = createModalDoneFn(() => {
      // Do nothing
    });
    let cancel = createModalCancelFn(() => {
      // Do nothing
    });

    ModalService.userSearch.onShow = (event) => {
      done = () => {
        if (event.onDone) {
          event.onDone();
        }
      };
      cancel = () => {
        if (event.onDone) {
          event.onDone();
        }
      };
      data.value = event;
      throwable(async () => {
        await api.user.get();
        await api.user.getFriends();
        await api.userInvitation.getAll();
      });
    };

    async function search() {
      if (pageData.value.username.length > 3) {
        await throwable(
          async () => {
            return await api.user.search({ term: pageData.value.username });
          },
          async (result) => {
            users.value = result;
          },
        );
      } else {
        users.value = [];
      }
    }

    return () => (
      <Modal
        modalName="userSearch"
        title={data.value.title || 'Find people'}
        onDone={() => {
          if (done) {
            done();
            return true;
          }
          return false;
        }}
        onCancel={() => {
          if (cancel) {
            cancel();
          }
        }}
        doneText="Confirm"
      >
        <div class="modUserSearch">
          <TextInput
            label="Username"
            placeholder="Enter persons username"
            onInput={(value, event) => {
              const result = value.replace(/[^a-z0-9]/g, '');
              (event.target as HTMLInputElement).value = result;
              pageData.value.username = result;
              clearTimeout(timeout);
              timeout = setTimeout(async () => {
                await search();
              }, 1000);
            }}
          />
          <div class="modUserSearch--result">
            {users.value.length > 0 ? (
              users.value.map((user) => {
                return (
                  <div
                    class={`modUserSearch--user ${
                      friends.value.find((e) => e._id === user._id)
                        ? 'modUserSearch--user_friend'
                        : ''
                    }`}
                  >
                    <Avatar user={user} />
                    <div class="modUserSearch--user-info">
                      <div class="modUserSearch--user-name">
                        {user.username}
                      </div>
                      {friends.value.find((e) => e._id === user._id) ? (
                        <div class="modUserSearch--user-status">Friend</div>
                      ) : invitations.value.find(
                          (e) => e.to === user._id || e.from === user._id,
                        ) ? (
                        <div class="modUserSearch--user-status">
                          Waiting invitation
                        </div>
                      ) : (
                        ''
                      )}
                    </div>
                    {!friends.value.find((e) => e._id === user._id) &&
                    !invitations.value.find(
                      (e) => e.to === user._id || e.from === user._id,
                    ) ? (
                      <button
                        onClick={async () => {
                          await throwable(async () => {
                            await api.userInvitation.create({
                              userId: user._id,
                            });
                          });
                        }}
                      >
                        {friends.value.find((e) => e._id === user._id)
                          ? 'Remove'
                          : 'Invite'}
                      </button>
                    ) : (
                      ''
                    )}
                  </div>
                );
              })
            ) : (
              <p>There are no results.</p>
            )}
          </div>
        </div>
      </Modal>
    );
  },
});
