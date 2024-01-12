import { computed, defineComponent } from 'vue';
import { useDb } from '../db';
import { Button } from '../components';
import { SetupLayout } from '../layout';
import { useRouter } from '../router';

export const AccountView = defineComponent({
  setup() {
    const router = useRouter();
    const db = useDb();
    const account = computed(() => db.accounts.methods.latest());
    console.log(account.value);

    return () => (
      <SetupLayout>
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
            router.back();
          }}
        >
          Back
        </Button>

        </div>
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
