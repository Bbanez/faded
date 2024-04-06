import { DefineComponent } from 'vue';
import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import { HomeView } from './views/home.tsx';
import { GameView } from './views/game.tsx';
import { AccountView } from './views/account.tsx';
import { NewAccountView } from './views/new-account.tsx';
import { SettingsView } from './views/settings.tsx';
import { Layouts } from './layout';
import { P404View } from './views/404.tsx';

export const views = {
    HomeView,
    GameView,
    AccountView,
    NewAccountView,
    SettingsView,
    P404View,
};

export type Views = keyof typeof views;

export interface RouteMeta {
    title?: string;
    layout?: Layouts;
    class?: string;
    overrideComponent?: DefineComponent<
        any,
        any,
        any,
        any,
        any,
        any,
        any,
        any,
        any,
        any,
        any,
        any,
        any
    >;
}

interface RouteRecordRawExtended
    extends Omit<RouteRecordRaw, 'name' | 'children' | 'meta'> {
    name?: Views;
    children?: Array<RouteRecordRawExtended>;
    meta?: RouteMeta;
}

const routes: Array<RouteRecordRawExtended> = [
    {
        path: '/',
        name: 'HomeView',
        meta: {
            title: 'Home',
            layout: 'DefaultLayout',
        },
        component: HomeView,
    },
    {
        path: '/account/new',
        name: 'NewAccountView',
        meta: {
            title: 'Create account',
            layout: 'DefaultLayout',
        },
        component: NewAccountView,
    },
    // {
    //     path: '/account/load',
    //     name: 'AccountView',
    //     meta: {
    //         title: 'Load account',
    //         layout: 'DefaultLayout',
    //     },
    //     component: AccountView,
    // },
    {
        path: '/account/:username',
        name: 'AccountView',
        meta: {
            title: 'My account',
            layout: 'DefaultLayout',
        },
        component: AccountView,
    },
    {
        path: '/account/:username/map/:map_slug/game',
        name: 'GameView',
        meta: {
            title: 'Game',
        },
        component: GameView,
    },
    {
        path: '/settings',
        name: 'SettingsView',
        meta: {
            title: 'Settings',
            layout: 'DefaultLayout',
        },
        component: SettingsView,
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'P404View',
        component: P404View,
    },
];

export const router = createRouter({
    history: createWebHashHistory(),
    routes: routes as any,
});
