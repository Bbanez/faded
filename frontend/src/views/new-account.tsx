import { defineComponent, ref } from 'vue';
import { createRefValidator, createValidationItem } from '../util';
import { useRouter } from '../router';
import { useAccounts, useActiveAccount } from '../hooks/account';
import { AccountCreate } from '../../wailsjs/go/game/Api';
import { Input } from '../components/inputs/input';
import { Button } from '../components/button';
import { Link } from '../components/link';

export const NewAccountView = defineComponent({
    setup() {
        const router = useRouter();
        const accounts = useAccounts();
        const activeAccountQuery = useActiveAccount();
        const data = ref({
            username: createValidationItem({
                value: '',
                handler(value) {
                    if (!value) {
                        return 'Please enter username';
                    }
                    const account = accounts.find((e) => e.username === value);
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
            activeAccountQuery.data.value = await AccountCreate(data.value.username.value);
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
                    <Link href={`home`}>Back</Link>
                </div>
            </div>
        );
    },
});
