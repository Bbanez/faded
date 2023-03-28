import { createRouter, createWebHistory } from 'vue-router';
import { SDK } from './sdk';
import { throwable } from './util';
import Login from './views/login';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL || undefined),
  routes: [
    {
      path: '/',
      name: 'login',
      component: Login,
    },
    {
      path: '/sign-up',
      name: 'signUp',
      component: () => import('./views/sign-up'),
    },
    {
      path: '/sign-up/complete',
      name: 'signUpComplete',
      component: () => import('./views/sign-up-complete'),
    },
    {
      path: '/game',
      name: 'game',
      component: () => import('./views/game/main'),
    },
  ],
});

router.beforeEach(async (to) => {
  if (to.path.startsWith('/game')) {
    const user = await throwable(
      async () => {
        return await SDK.user.me();
      },
      async (result) => {
        return result;
      },
      async () => {
        return null;
      },
    );
    if (!user) {
      return '/';
    }
  }
});

export default router;
