import { Ref, ref } from 'vue';
import { AccountView, GameView, Home } from './views';
import { NewAccountView } from './views/new-account';
import { browserStorage } from './browser-storage';

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

export class Router {
  constructor(
    public path: PageNames,
    public data: RouteData,
    public history: Array<{
      path: PageNames;
      data: RouteData;
    }>,
  ) {}

  push(path: PageNames, data?: RouteData): void {
    this.history.push({ path: this.path, data: data || {} });
    this.path = path;
    this.data = data || {};
    browserStorage.set('router', {
      h: this.history,
      p: this.path,
      d: this.data,
    });
  }

  replace(path: PageNames, data?: RouteData): void {
    this.history[this.history.length - 1] = {
      path,
      data: data || {},
    };
    this.path = path;
    this.data = data || {};
    browserStorage.set('router', {
      h: this.history,
      p: this.path,
      d: this.data,
    });
  }

  back() {
    if (this.history.length > 0) {
      const history = this.history.slice(this.history.length - 1, 1)[0];
      this.path = history.path;
      this.data = history.data;
      browserStorage.set('router', {
        h: this.history,
        p: this.path,
        d: this.data,
      });
    }
  }
}

let router: Ref<Router> = null as never;

export function useRouter(): Router {
  if (!router) {
    const storageData: any = browserStorage.get('router');
    if (storageData) {
      router = ref(new Router(storageData.p, storageData.d, storageData.h));
    } else {
      router = ref(new Router('home', {}, []));
    }
  }
  return router.value;
}
