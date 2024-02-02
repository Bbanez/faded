import { defineComponent } from 'vue';
import { Link } from '../components';
import { SetupLayout } from '../layout';
import { useActiveAccount } from '../rust/account';

export const Home = defineComponent({
  setup() {
    const activeAccount = useActiveAccount();

    return () => (
      <SetupLayout>
        <div class="flex flex-col gap-2">
          {activeAccount.data.value && (
            <Link asButton="primary" href={'account'}>
              Continue
            </Link>
          )}
          <Link asButton="primary" href={'new-account'}>
            New Game
          </Link>
          <Link asButton="primary" href={'settings'}>
            Settings
          </Link>
        </div>
      </SetupLayout>
    );
  },
});
