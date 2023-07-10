import { useApi } from '@ui/api';
import { Avatar, Button, TextInput } from '@ui/component';
import { Layout } from '@ui/layout';
import { NotificationService } from '@ui/service';
import { useStore } from '@ui/store';
import { createRefValidator, createValidationItem, throwable } from '@ui/util';
import { computed, defineComponent, onMounted, ref } from 'vue';

export default defineComponent({
  setup() {
    const store = useStore();
    const api = useApi();
    const data = ref({
      username: createValidationItem({
        value: '',
        handler(value) {
          if (!value) {
            return 'Please enter a username.';
          }
        },
      }),
    });
    const validator = createRefValidator(data);
    const user = computed(() => store.user.methods.me());

    onMounted(async () => {
      await throwable(
        async () => {
          return await api.user.get();
        },
        async (result) => {
          data.value.username.value = result.username;
        },
      );
    });

    async function uploadAvatar(file: File) {
      if (!file.type.startsWith('image/')) {
        NotificationService.error('Avatar must be an image.');
        return;
      }
      if (file.size > 1024 * 1024) {
        NotificationService.error('Image cannot be over 1MB.');
        return;
      }
      await throwable(async () => {
        await api.user.uploadAvatar({ file });
      });
    }

    async function submit() {
      if (!validator()) {
        return;
      }
      await throwable(async () => {
        await api.user.update({
          username: data.value.username.value,
        });
      });
    }

    return () => (
      <Layout title="Edit profile">
        {user.value && (
          <div class="user">
            <div class="user--left">
              <Avatar class="user--left-avatar" user={user.value} />
              <div class="user--left-avatarChange">
                <div>Change</div>
                <input
                  type="file"
                  onChange={async (event) => {
                    const el = event.target as HTMLInputElement;
                    if (el.files && el.files[0]) {
                      await uploadAvatar(el.files[0]);
                    }
                  }}
                />
              </div>
            </div>
            <div class="user--right">
              <form
                onSubmit={async (event) => {
                  event.preventDefault();
                  await submit();
                }}
              >
                <TextInput
                  label="Username"
                  placeholder="Enter your username"
                  invalidText={data.value.username.error}
                  value={data.value.username.value}
                  onInput={(value, event) => {
                    const result = value.replace(/[^a-z0-9]/g, '');
                    (event.target as HTMLInputElement).value = result;
                    data.value.username.value = result;
                  }}
                />
                <Button>Save</Button>
              </form>
            </div>
          </div>
        )}
      </Layout>
    );
  },
});
