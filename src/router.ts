import { DefineComponent } from 'vue';
import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import { HomeView } from './views/home.tsx';
import { AccountView } from './views/account.tsx';
import { NewAccountView } from './views/new-account.tsx';
import { SettingsView } from './views/settings.tsx';
import { Layouts } from './layout';
import { P404View } from './views/404.tsx';
import { AccountLoadView } from './views/account-load.tsx';
// import { GameView } from './views/game.tsx';
import { GameStartView } from './views/game-start.tsx';
import { MapMakerView } from './views/map-maker.tsx';
import { MapMakerSelectView } from './views/map-maker-select.tsx';

export const views = {
    MapMakerView,
    MapMakerSelectView,
    HomeView,
    // GameView,
    GameStartView,
    AccountView,
    NewAccountView,
    AccountLoadView,
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
    {
        path: '/account/load',
        name: 'AccountLoadView',
        meta: {
            title: 'Load account',
            layout: 'DefaultLayout',
        },
        component: AccountLoadView,
    },
    {
        path: '/account/:accountId',
        name: 'AccountView',
        meta: {
            title: 'My account',
            layout: 'DefaultLayout',
        },
        component: AccountView,
    },
    {
        path: '/account/:accountId/map',
        name: 'GameStartView',
        meta: {
            title: 'Start a game',
            layout: 'DefaultLayout',
        },
        component: GameStartView,
    },
    // {
    //     path: '/account/:accountId/map/:mapId/character/:characterId/game/:managerId',
    //     name: 'GameView',
    //     meta: {
    //         title: 'Game',
    //     },
    //     component: GameView,
    // },
    {
        path: '/account/:accountId/map-maker',
        name: 'MapMakerSelectView',
        meta: {
            title: 'Map maker list',
            layout: 'DefaultLayout',
        },
        component: MapMakerSelectView,
    },
    {
        path: '/account/:accountId/map-maker/:mapId',
        name: 'MapMakerView',
        meta: {
            title: 'Map maker',
        },
        component: MapMakerView,
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
