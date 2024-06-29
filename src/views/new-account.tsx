import { defineComponent, ref } from 'vue';
import { createRefValidator, createValidationItem } from '../util/validation';
import { Input } from '../components/inputs/input';
import { Button } from '../components/button.tsx';
import { useRouter } from 'vue-router';
import { useSdk } from '../sdk/main.ts';
import { throwable } from '../util/throwable.ts';
import { NotificationService } from '../services/notification.ts';

export const NewAccountView = defineComponent({
    setup() {
        const sdk = useSdk();
        const router = useRouter();
        const data = ref({
            username: createValidationItem({
                value: '',
                handler(value) {
                    if (!value) {
                        return 'Please enter username';
                    }
                    const account = sdk.account.store.findById(value);
                    if (account) {
                        return 'Account with this name already exist';
                    }
                },
            }),
        });
        const validate = createRefValidator(data);

        async function submit() {
            if (!validate()) {
                return;
            }
            await throwable(
                async () => {
                    return await sdk.account.create(data.value.username.value);
                },
                async (account) => {
                    NotificationService.push(
                        'success',
                        'Account created successfully',
                    );
                    await router.push(`/account/${account.username}`);
                },
            );
        }

        return () => (
            <div
                class={`min-w-full min-h-full flex flex-col gap-4 items-center justify-center`}
            >
                <Input
                    label="Username"
                    error={data.value.username.error}
                    value={data.value.username.value}
                    onInput={(value) => {
                        data.value.username.value = value;
                    }}
                />
                <Button
                    onClick={async () => {
                        await submit();
                    }}
                >
                    Create
                </Button>
            </div>
        );
    },
});
