import { computed, defineComponent } from 'vue';
import { Pages, useRoute } from './router';

export const Router = defineComponent({
  setup() {
    const route = useRoute();
    const Page = computed(() => {
      if (Pages[route.path]) {
        return Pages[route.path];
      }
      return Pages.home;
    });

    return () => (
      <>
        <Page.value />
      </>
    );
  },
});
