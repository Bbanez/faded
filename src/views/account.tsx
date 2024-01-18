import { defineComponent } from 'vue';
import { Button } from '../components';
import { SetupLayout } from '../layout';
import { useRouter } from '../router';
import { useActiveAccount } from '../rust/account.ts';

export const AccountView = defineComponent({
  setup() {
    const router = useRouter();
    const activeAccount = useActiveAccount((data) => {
      if (!data) {
        router.push('home');
      }
    });

    return () => (
      <SetupLayout>
        {activeAccount.isLoaded.value && (
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
      // <div class="flex flex-col">
      //   <div>
      //     <Link href="home">Back</Link>
      //   </div>
      //   <div>
      //     <Link href="game">Start Game</Link>
      //     <button
      //       onClick={async () => {
      //         const timeOffset = Date.now();
      //         await invoke('test');
      //         console.log(Date.now() - timeOffset);
      //       }}
      //     >
      //       Test
      //     </button>
      //   </div>
      // </div>
    );
  },
});
