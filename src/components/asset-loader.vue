<script lang="tsx">
import { defineComponent, onMounted, onUnmounted, ref } from 'vue';
import { Loader } from '../game';

const component = defineComponent({
  setup() {
    const loading = ref<{ name: string; loaded: number } | null>(null);
    let unsub = () => {
      // Not mounted
    };

    onMounted(() => {
      unsub = Loader.subscribe((type, name, loaded) => {
        if (type === 'completed') {
          loading.value = null;
        } else {
          loading.value = { name, loaded };
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
export default component;
</script>
