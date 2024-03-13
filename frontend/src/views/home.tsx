import { computed, defineComponent } from 'vue';
import { SetupLayout, SetupNavItem } from '../layout';
import { useActiveAccount } from '../hooks/account';

export const Home = defineComponent({
    setup() {
        const activeAccountQuery = useActiveAccount();
        const navItems = computed(() => {
            const output: SetupNavItem[] = [];
            if (activeAccountQuery.data.value) {
                output.push({
                    text: 'Continue',
                    href: 'account',
                });
            }
            output.push(
                {
                    text: 'Create profile',
                    href: 'new-account',
                },
                {
                    text: 'Settings',
                    href: 'settings',
                },
            );
            return output;
        });

        return () => <SetupLayout navItems={navItems.value}></SetupLayout>;
    },
});
