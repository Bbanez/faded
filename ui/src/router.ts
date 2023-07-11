import { UserProtected } from '@backend/user';
import {
  createRouter,
  createWebHistory,
  type NavigationGuardNext,
  type RouteRecordRaw,
} from 'vue-router';
import { useApi } from './api';
import Login from './views/login';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Login',
    component: Login,
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () =>
      import(/* webpackChunkName: "dashboard" */ './views/dashboard/home'),
  },
  {
    path: '/dashboard/setup',
    name: 'Setup',
    component: () =>
      import(/* webpackChunkName: "setup" */ './views/dashboard/setup'),
  },
  {
    path: '/dashboard/user',
    name: 'UserMe',
    component: () =>
      import(/* webpackChunkName: "user-me" */ './views/dashboard/user'),
  },
  {
    path: '/dashboard/user/:username',
    name: 'UserId',
    component: () =>
      import(
        /* webpackChunkName: "user-id" */ './views/dashboard/user-profile'
      ),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'P404',
    meta: {
      protected: false,
    },
    component: () => import(/* webpackChunkName: "p404" */ './views/404'),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

const noAuthRoutes = ['/', '/login', '/logout'];

function toLogin(next: NavigationGuardNext) {
  const query = window.location.href.split('?');
  let url = window.location.pathname;
  if (query[1]) {
    url = url + '?' + query[1];
  }
  next({
    path: '/',
    query: {
      forward: url,
    },
  });
}

router.beforeEach(async (to, _, next) => {
  const api = useApi();
  const jwt = api.accessToken;
  if (to.name === 'P404') {
    next();
  } else if (noAuthRoutes.find((e) => e === to.path)) {
    next();
  } else if (jwt && (await api.isLoggedIn())) {
    if (to.path !== '/dashboard/setup') {
      const user = (await api.user.get()) as UserProtected;
      if (!user.setupDone) {
        next('/dashboard/setup');
        return;
      }
    }
    next();
    return;
  } else {
    toLogin(next);
  }
});

export default router;
