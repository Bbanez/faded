import { computed, defineComponent } from 'vue';
import { Pages, useRouter } from './router';

export const Router = defineComponent({
    setup() {
        const router = useRouter();
        const Page = computed(() => {
            if (Pages[router.path]) {
                return Pages[router.path];
            }
            return Pages.home;
        });

        return () => (
            <>
                <Page.value />
            </>
        );
    },
});
