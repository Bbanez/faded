import { Loader } from 'svemir';
import { defineComponent, onMounted, onUnmounted, ref } from 'vue';

export const AssetLeader = defineComponent({
  setup() {
    const loading = ref<{ name: string; loaded: number } | null>(null);
    let unsub = () => {
      // Not mounted
    };

    onMounted(() => {
      unsub = Loader.subscribe(({ type, item }) => {
        if (type === 'done') {
          loading.value = null;
        } else {
          if (item) {
            loading.value = { name: item.path + '', loaded: item.progress };
          }
        }
      });
    });
    onUnmounted(() => {
      unsub();
    });

    return () => (
      <div
        class="assetLoader"
        style={`display: ${loading.value ? 'flex' : 'none'};`}
      >
        <div class="assetLoader--name">
          {loading.value ? loading.value.name : ''}
        </div>
        <div class="assetLoader--progress_wrapper">
          <div
            class="assetLoader--progress"
            style={`width: ${loading.value ? loading.value.loaded : '0'}%;`}
          />
        </div>
      </div>
    );
  },
});
