import { getMapChunkData } from '@/game/util';
import { defineComponent, onMounted } from 'vue';

const component = defineComponent({
  setup() {
    onMounted(async () => {
      const result = await getMapChunkData('/map/test.png');
      console.log(result);
    });
    return () => <h1>Util</h1>;
  },
});

export default component;
