import { useApi } from '@ui/api';
import { Avatar, DefaultComponentProps, Link } from '@ui/component';
import { useStore } from '@ui/store';
import { throwable } from '@ui/util';
import { computed, defineComponent, onMounted } from 'vue';
import { useRouter } from 'vue-router';

export interface LayoutNavItem {
  name: string;
  expended?: boolean;
  selected?: boolean;
  link?: string;
  children?: LayoutNavItem[];
}

export const Layout = defineComponent({
  props: {
    ...DefaultComponentProps,
    title: String,
  },
  setup(props, ctx) {
    const router = useRouter();
    const navItems: LayoutNavItem[] = [
      {
        name: 'Start a game',
        link: '/dashboard/start-game',
      },
      {
        name: 'Maps explorer',
        link: '/dashboard/map',
      },
      {
        name: 'Map maker',
        link: '/dashboard/map-maker',
      },
    ];
    const api = useApi();
    const store = useStore();

    const me = computed(() => store.user.methods.me());

    onMounted(async () => {
      await throwable(async () => {
        await api.user.get();
      });
    });

    async function logout() {
      await throwable(
        async () => {
          await api.auth.logout();
        },
        async () => {
          await router.push('/');
        },
      );
    }

    return () => (
      <div
        id={props.id}
        style={props.style}
        class={`layout ${props.class || ''}`}
      >
        <div class="layout--nav">
          <div class="layout--nav-home">
            <Link href="/dashboard">Faded</Link>
          </div>
          <Link class="layout--nav-user" href={`/dashboard/user`}>
            {me.value && (
              <>
                <Avatar user={me.value} />
                <div class="layout--nav-username">{me.value.username}</div>
              </>
            )}
          </Link>
          <div class="layout--nav-items">
            {navItems.map((navItem) => (
              <div
                class={`layout--nav-item ${
                  navItem.selected ? 'layout--nav-item_selected' : ''
                }`}
              >
                <Link href={navItem.link || ''}>{navItem.name}</Link>
              </div>
            ))}
          </div>
          <div class="layout--nav-logout">
            <button
              class="layout--nav-item"
              onClick={async () => {
                await logout();
              }}
            >
              Logout
            </button>
          </div>
        </div>
        <div class="layout--body">
          {props.title && <h1>{props.title}</h1>}
          <div class="layout--body-inner">
            {ctx.slots.default ? ctx.slots.default() : ''}
          </div>
        </div>
      </div>
    );
  },
});
