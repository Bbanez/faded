import { useApi } from '@ui/api';
import { Layout } from '@ui/layout';
import { useStore } from '@ui/store';
import { throwable } from '@ui/util';
import { computed, defineComponent, onMounted } from 'vue';
import { useRoute } from 'vue-router';

export default defineComponent({
  setup() {
    const api = useApi();
    const store = useStore();
    const route = useRoute();
    const map = computed(() =>
      store.map.find((e) => e.slug === route.params.mapId),
    );

    onMounted(async () => {
      await throwable(async () => {
        await api.map.getAll();
      });
    });

    return () => <Layout title={map.value ? map.value.title : 'Map'}>
      {map.value ? (
        <div class="map"></div>
      ) : ''}
    </Layout>
  },
});
