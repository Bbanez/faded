import { defineComponent } from 'vue';
import { SetupLayout } from '../layout';
import { useActiveAccount } from '../hooks/account.ts';
import { Link } from '../components/link.tsx';

export const Home = defineComponent({
    setup() {
        const activeAccountQuery = useActiveAccount();

        return () => (
            <SetupLayout>
                <div class="flex flex-col gap-2">
                    {activeAccountQuery.data.value && (
                        <Link asButton="primary" href={'account'}>
                            Continue
                        </Link>
                    )}
                    <Link asButton="primary" href={'new-account'}>
                        New Game
                    </Link>
                    <Link asButton="primary" href={'settings'}>
                        Settings
                    </Link>
                </div>
            </SetupLayout>
        );
    },
});
