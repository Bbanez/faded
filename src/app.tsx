import { computed, defineComponent } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import { RouteMeta } from './router.ts';
import { layouts } from './layout';
import { Toast } from './components/toast.tsx';
import { modal } from './services/modal.tsx';

export const App = defineComponent({
    setup() {
        const route = useRoute();
        const meta = computed(() => (route.meta as RouteMeta) || {});
        const Layout = computed(() =>
            meta.value.layout ? layouts[meta.value.layout] : 'div',
        );

        return () => (
            <div class="root">
                <Layout.value {...meta.value}>
                    <RouterView />
                </Layout.value>

                {modal.mount()}
                <Toast />
            </div>
        );
    },
});
