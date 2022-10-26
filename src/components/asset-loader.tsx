import { Loader } from 'svemir';
import { defineComponent, ref } from 'vue';

export const AssetLoader = defineComponent({
  setup() {
    const show = ref(false);
    const file = ref('test');
    const progress = ref('');

    Loader.subscribe((data) => {
      if (data.type === 'done') {
        show.value = false;
      } else if (data.type === 'progress' && data.item) {
        show.value = true;
        file.value = data.item.name;
        progress.value = data.item.progress.toFixed(0);
      }
    });

    return () => (
      <div class={`assetLoader ${show.value ? 'assetLoader_visible' : ''}`}>
        <div class="assetLoader--prec">{progress.value}%</div>
        <div class="assetLoader--bar">
          <div
            class="assetLoader--bar-progress"
            style={{ width: `${progress.value}%` }}
          />
        </div>
        <div class="assetLoader--file">{file.value}</div>
      </div>
    );
  },
});
