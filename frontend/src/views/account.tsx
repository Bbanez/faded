import { defineComponent } from 'vue';
import { SetupLayout } from '../layout';

export const AccountView = defineComponent({
    setup() {

        return () => (
            <SetupLayout
                navItems={[
                    {
                        text: 'Start a game',
                        href: 'game',
                    },
                    {
                        text: 'Load a game',
                        href: 'game',
                    },
                    {
                        class: 'mt-auto',
                        text: 'Back',
                        href: 'home',
                    },
                ]}
            >
            </SetupLayout>
        );
    },
});
