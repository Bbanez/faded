import { debounce } from '@fdd/util/debounce';
import { onBeforeUnmount, onMounted, ref } from 'vue';

export function useScreen() {
    const data = ref({
        width: window.innerWidth,
        height: window.innerHeight,
        aspect: window.innerWidth / window.innerHeight,
    });

    const onResizeDebounced = debounce(() => {
        data.value.width = window.innerWidth;
        data.value.height = window.innerHeight;
        data.value.aspect = window.innerWidth / window.innerHeight;
    }, 100);

    onMounted(() => {
        window.addEventListener('resize', onResizeDebounced);
    });

    onBeforeUnmount(() => {
        window.removeEventListener('resize', onResizeDebounced);
    });

    return data;
}
