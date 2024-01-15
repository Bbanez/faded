import { defineComponent } from 'vue';
import { Button } from '../components';
import { SetupLayout } from '../layout';
import { useRouter } from '../router';
import { useActiveAccount } from '../rust/account';

export const Home = defineComponent({
  setup() {
    const activeAccount = useActiveAccount();
    const router = useRouter();

    return () => (
      <SetupLayout>
        <div class="flex flex-col gap-2">
          {activeAccount && (
            <Button
              onClick={() => {
                router.push('account');
              }}
            >
              Continue
            </Button>
          )}
          <Button
            onClick={() => {
              router.push('new-account');
            }}
          >
            New Game
          </Button>
        </div>
      </SetupLayout>
    );
  },
});
