import { defineComponent } from 'vue';
import { Router } from './_router';

export const App = defineComponent({
    setup() {
        return () => (
            <div class="root">
                <Router />
            </div>
        );
    },
});
