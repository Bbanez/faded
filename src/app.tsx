import { defineComponent, onMounted } from 'vue';
import { Router } from './_router';
import { DBHandler, useDb } from './db';

export const App = defineComponent({
  setup() {
    const db = useDb();

    onMounted(async () => {
      for (const k in db) {
        const key = k as keyof DBHandler;
        await db[key].setup();
      }
    });

    return () => (
      <div class="root">
        <Router />
      </div>
    );
  },
});