import { defineComponent, ref } from 'vue';
import { createRefValidator, createValidationItem } from '../util/validation';
import { useRouter } from '../router';
import { Input } from '../components/inputs/input';
import { Button } from '../components/button.tsx';
import { Link } from '../components/link.tsx';
import { useAccounts, useActiveAccount } from '../hooks/account.ts';
import { rust_api_calls } from '../rust/api-call.ts';

export const NewAccountView = defineComponent({
    setup() {
        const router = useRouter();
        const accountsQuery = useAccounts();
        const activeAccountQuery = useActiveAccount();
        const data = ref({
            username: createValidationItem({
                value: '',
                handler(value) {
                    if (!value) {
                        return 'Please enter username';
                    }
                    const account = accountsQuery.data.value?.find(
                        (e) => e.username === value,
                    );
                    if (account) {
                        return 'You already have account with this username';
                    }
                },
            }),
        });
        const validate = createRefValidator(data);

        async function submit() {
            if (!validate()) {
                return;
            }
            await rust_api_calls.account_create({
                username: data.value.username.value,
            });
            await activeAccountQuery.reFetch();
            router.push('account');
        }

        return () => (
            <div class="relative">
                <div class="absolute top-0 left-0 w-full h-screen flex flex-col items-center">
                    <div class="m-auto">
                        <Input
                            label="Username"
                            error={data.value.username.error}
                            value={data.value.username.value}
                            onInput={(value) => {
                                data.value.username.value = value;
                            }}
                        />
                        <Button
                            onClick={() => {
                                submit();
                            }}
                        >
                            Create
                        </Button>
                    </div>
                </div>
                <div class="relative">
                    <Link href="home">Back</Link>
                </div>
            </div>
        );
    },
});
