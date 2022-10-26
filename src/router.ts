import {
  createRouter,
  createWebHistory,
  NavigationGuardNext,
} from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import Login from './views/login';
import type { Sdk } from './sdk/main';
import { useSdk } from './sdk';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Login',
    component: Login,
  },
  {
    path: '/login',
    name: 'Login2',
    component: Login,
  },
  {
    path: '/sign-up',
    name: 'SignUp',
    component: () =>
      import(/* webpackChunkName: "sign-up" */ './views/sign-up'),
  },
  {
    path: '/sign-up/complete',
    name: 'SignUpComplete',
    component: () =>
      import(
        /* webpackChunkName: "sign-up-complete" */ './views/sign-up-complete'
      ),
  },
  {
    path: '/game',
    name: 'Game',
    component: () => import(/* webpackChunkName: "game" */ './views/game'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'P404',
    component: () => import(/* webpackChunkName: "p404" */ './views/404'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const noAuthRoutes = [
  '/',
  '/login',
  '/sign-up',
  '/sign-up/complete',
  '/forgot-password',
  '/reset-password',
];
let sdk: Sdk;

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
  if (!sdk) {
    sdk = useSdk();
  }
  const jwt = sdk.accessToken;
  if (to.name === 'P404') {
    next();
  } else if (noAuthRoutes.find((e) => e === to.path)) {
    next();
  } else if ((await sdk.isLoggedIn()) && jwt) {
    if (to.path.startsWith('/admin') && jwt.payload.rls[0].name !== 'ADMIN') {
      toLogin(next);
    } else {
      next();
    }
  } else {
    toLogin(next);
  }
});

export default router;
