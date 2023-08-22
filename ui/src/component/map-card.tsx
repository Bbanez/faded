import { FddMapEntryMeta } from '@backend/bcms-types';
import { defineComponent, PropType } from 'vue';
import { useRouter } from 'vue-router';
import { Icon } from './icon';
import { Link } from './link';

export const MapCard = defineComponent({
  props: {
    item: {
      type: Object as PropType<FddMapEntryMeta>,
      required: true,
    },
  },
  setup(props) {
    const router = useRouter();

    return () => (
      <Link
        href={`/dashboard/map-explorer/${props.item.slug}`}
        class="mapCard"
        onClick={async (event) => {
          event.preventDefault();
          await router.replace(
            window.location.pathname + `?id=${props.item.slug}`,
          );
          await router.push(`/dashboard/map-explorer/${props.item.slug}`);
        }}
      >
        <div class="mapCard--image">
          <img
            src={`/api/v1/asset/${props.item.cover._id}`}
            alt={props.item.cover.alt_text}
          />
        </div>
        <div class="mapCard--text">
          <div class="mapCard--title">{props.item.title}</div>
          <div class="mapCard--players">
            <Icon src="/feather/user" />
            <span>{props.item.max_players}</span>
          </div>
        </div>
      </Link>
    );
  },
});
