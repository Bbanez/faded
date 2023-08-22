import { useApi } from '@ui/api';
import { MapCard, Scrollable } from '@ui/component';
import { Layout } from '@ui/layout';
import { useStore } from '@ui/store';
import { throwable } from '@ui/util';
import { computed, defineComponent, onMounted } from 'vue';

export default defineComponent({
  setup() {
    const api = useApi();
    const store = useStore();
    const maps = computed(() => store.map.items());

    onMounted(async () => {
      await throwable(async () => {
        await api.map.getAll();
      });
    });

    return () => (
      <Layout title="Map explorer" class="mapExplorer">
        <Scrollable
          class="mapExplorer--items"
          height={500}
          itemHeight={80}
          items={maps.value.map((map) => {
            return <MapCard item={map} />;
          })}
        ></Scrollable>
      </Layout>
    );
  },
});
