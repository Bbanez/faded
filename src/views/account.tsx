import { computed, defineComponent } from 'vue';
import { useDb } from '../db';
import { Link } from '../components';
import { invoke } from '@tauri-apps/api';

export const AccountView = defineComponent({
  setup() {
    const db = useDb();
    const account = computed(() => db.accounts.methods.latest());
    console.log(account.value);

    return () => (
      <div class="flex flex-col">
        <div>
          <Link href="home">Back</Link>
        </div>
        <div>
          <Link href="game">Start Game</Link>
          <button
            onClick={async () => {
              const timeOffset = Date.now();
              await invoke('test');
              console.log(Date.now() - timeOffset);
            }}
          >
            Test
          </button>
        </div>
      </div>
    );
  },
});
