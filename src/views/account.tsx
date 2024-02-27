import { defineComponent } from 'vue';
import { SetupLayout } from '../layout';
import { useRouter } from '../router';
import { useActiveAccount } from '../hooks/account.ts';
import { Button } from '../components/button.tsx';

export const AccountView = defineComponent({
  setup() {
    const router = useRouter();
    const [_, activeAccountLoaded] = useActiveAccount();

    return () => (
      <SetupLayout>
        {activeAccountLoaded.value && (
          <div class="flex flex-col gap-2">
            <Button
              onClick={() => {
                router.push('game');
              }}
            >
              Start Game
            </Button>
            <Button
              onClick={() => {
                router.push('game');
              }}
            >
              Load game
            </Button>
            <Button
              onClick={() => {
                router.replace('home');
              }}
            >
              Back
            </Button>
          </div>
        )}
      </SetupLayout>
    );
  },
});
