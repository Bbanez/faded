import { computed, defineComponent, onMounted } from 'vue';
import { useSdk } from '../sdk/main.ts';
import { throwable } from '../util/throwable.ts';
import { Button } from '../components/button.tsx';
import { useRouter } from 'vue-router';

export const AccountLoadView = defineComponent({
    setup() {
        const router = useRouter();
        const sdk = useSdk();
        const accounts = computed(() => sdk.account.store.items());

        onMounted(async () => {
            await throwable(async () => {
                await sdk.account.get_all();
            });
        });

        return () => (
            <div
                class={`flex flex-col gap-4 items-center justify-center h-full`}
            >
                {accounts.value.map((account) => {
                    return (
                        <Button
                            kind={`primary`}
                            onClick={async () => {
                                await throwable(
                                    async () => {
                                        await sdk.account.load(
                                            account.username,
                                        );
                                    },
                                    async () => {
                                        await router.push(
                                            `/account/${account.username}`,
                                        );
                                    },
                                );
                            }}
                        >
                            {account.username}
                        </Button>
                    );
                })}
            </div>
        );
    },
});
