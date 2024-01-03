import { computed, defineComponent } from 'vue';
import { Link } from '../components';
import { useDb } from '../db';

export const Home = defineComponent({
  setup() {
    const db = useDb();
    const account = computed(() => db.accounts.methods.latest());

    return () => (
      <div>
        <div>
          {account.value && <Link href="account">Continue</Link>}
          <Link href="new-account">New Game</Link>
        </div>
      </div>
    );
  },
});
