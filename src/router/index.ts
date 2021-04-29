import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Login from "../views/login.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Login",
    component: Login,
  },
  {
    path: "/login",
    name: "Login2",
    component: Login,
  },
  {
    path: "/game",
    name: "Home",
    component: () => import(/* webpackChunkName: "home" */ "../views/game/index.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
