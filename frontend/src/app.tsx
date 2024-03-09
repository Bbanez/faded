import { defineComponent } from 'vue';
import { HelloWorld } from './components/hello-world';

export const App = defineComponent({
    setup() {
        return () => (
            <div>
                <img id="logo" alt="Wails logo" src="/images/logo-universal.png" />
                <HelloWorld />
              <button>Test</button>
            </div>
        );
    },
});
