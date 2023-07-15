import { Link } from '@ui/component';
import { Layout } from '@ui/layout';
import { defineComponent } from 'vue';

export default defineComponent({
  setup() {
    return () => <Layout title="Map maker">
      <div class="mapMaker">
        <Link href='/dashboard/map-maker/new'>Create new map</Link>
      </div>
    </Layout>;
  },
});
