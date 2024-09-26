import { defineComponent } from 'vue';
import { Link } from '@fdd/components/link.tsx';

export const HomeView = defineComponent({
    setup() {
        return () => (
            <div class="flex flex-col gap-2">
                <Link href={'/bcms'}>BCMS</Link>
            </div>
        );
    },
});
