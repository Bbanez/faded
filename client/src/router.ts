import { createRouter, createWebHistory } from 'vue-router';
import HomeView from './views/home';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL || undefined),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/__util',
      name: 'util',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('./views/util'),
    },
  ],
});

export default router;
