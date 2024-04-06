import { DefaultLayout } from './default.tsx';

export * from './default.tsx';

export const layouts = {
    DefaultLayout,
};

export type Layouts = keyof typeof layouts;
