import { computed, defineComponent } from 'vue';
import { Button } from '../components';
import { useDb } from '../db';
import { SetupLayout } from '../layout';
import { useRouter } from '../router';

export const Home = defineComponent({
  setup() {
    const db = useDb();
    const account = computed(() => db.accounts.methods.latest());
    const router = useRouter();

    return () => (
      <SetupLayout>
        <div class="flex flex-col gap-2">
          {account.value && (
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
