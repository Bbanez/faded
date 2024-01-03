import { Ref, ref } from 'vue';
import { AccountView, GameView, Home } from './views';
import { NewAccountView } from './views/new-account';

export const Pages = {
  home: Home,
  game: GameView,
  account: AccountView,
  'new-account': NewAccountView,
};

export type PageNames = keyof typeof Pages;

export interface RouteData {
  [name: string]: string;
}

export interface Route {
  path: PageNames;
  data: RouteData;
  history: Array<{
    path: PageNames;
    data: RouteData;
  }>;
  push(path: PageNames, data?: RouteData): void;
  replace(path: PageNames, data?: RouteData): void;
}

let route: Ref<Route>;

export function useRoute(): Route {
  if (!route) {
    route = ref<Route>({
      path: 'game',
      data: {},
      history: [
        {
          path: 'game',
          data: {},
        },
      ],

      push(path, data) {
        route.value.history.push({ path: route.value.path, data: data || {} });
        route.value.path = path;
        route.value.data = data || {};
      },

      replace(path, data) {
        route.value.history[route.value.history.length - 1] = {
          path,
          data: data || {},
        };
        route.value.path = path;
        route.value.data = data || {};
      },
    });
  }
  return route.value;
}
