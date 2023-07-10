import { UserPublic } from '@backend/user';
import { defineComponent, PropType } from 'vue';

export const Avatar = defineComponent({
  props: {
    user: { type: Object as PropType<UserPublic>, required: true },
  },
  setup(props) {
    return () => (
      <div class="avatar">
        <div class="avatar--wrapper">
          {props.user.image ? (
            <img src={props.user.image} />
          ) : (
            <div class="avatar--text">
              {props.user.username.substring(0, 1).toUpperCase() +
                props.user.username
                  .substring(
                    props.user.username.length - 1,
                    props.user.username.length,
                  )
                  .toUpperCase()}
            </div>
          )}
        </div>
      </div>
    );
  },
});
