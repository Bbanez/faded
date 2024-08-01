import { v4 as uuidv4 } from 'uuid';
import { computed, defineComponent, onMounted } from 'vue';
import type { JSX } from 'vue/jsx-runtime';
import { useRoute, useRouter } from 'vue-router';
import { useSdk } from '@fdd/sdk/main.ts';
import { Views } from '@fdd/router.ts';
import { throwable } from '@fdd/util/throwable.ts';

export interface DefaultLayoutNavItem {
    text: string;
    slot?: () => JSX.Element;
    class?: string;
    href?: string;
    onClick?(event: Event): void | Promise<void>;
}

export const DefaultLayout = defineComponent({
    setup(_, ctx) {
        const sdk = useSdk();
        const router = useRouter();
        const route = useRoute();
        const activeAccount = computed(() =>
            sdk.account.store.methods.findActive(),
        );

        const navItems = computed<DefaultLayoutNavItem[]>(() => {
            const accounts = sdk.account.store.items();
            const view = route.name as Views;
            const items: DefaultLayoutNavItem[] = [];
            switch (view) {
                case 'HomeView':
                    {
                        if (activeAccount.value) {
                            items.push({
                                text: 'Continue',
                                href: `/account/${activeAccount.value.username}`,
                            });
                        }
                        if (accounts.length > 1) {
                            items.push({
                                text: 'Load profile',
                                href: `/account/load`,
                            });
                        }
                        items.push(
                            {
                                text: 'Create profile',
                                href: '/account/new',
                            },
                            {
                                text: 'Settings',
                                href: '/settings',
                            },
                        );
                    }
                    break;

                case 'NewAccountView':
                    {
                        items.push({
                            text: 'Back',
                            href: '/',
                            class: 'mt-auto',
                        });
                    }
                    break;

                case 'AccountLoadView':
                    {
                        items.push({
                            text: 'Back',
                            href: '/',
                        });
                    }
                    break;

                case 'AccountView':
                    {
                        items.push(
                            {
                                text: 'Start a game',
                                href: `/account/${activeAccount.value?.username}/map`,
                            },
                            {
                                text: 'Load a game',
                                href: `/account/${activeAccount.value?.username}/load-game`,
                            },
                            {
                                text: 'Map maker',
                                href: `/account/${activeAccount.value?.username}/map-maker`,
                            },
                            {
                                class: 'mt-auto',
                                text: 'Back',
                                href: '/',
                            },
                        );
                    }
                    break;

                case 'GameStartView':
                    {
                        items.push({
                            text: 'Back',
                            href: `/account/${route.params.username}`,
                        });
                    }
                    break;

                case 'SettingsView':
                    {
                        items.push({
                            text: 'Back',
                            class: 'mt-auto',
                            href: '/',
                        });
                    }
                    break;

                case 'MapMakerSelectView':
                    {
                        items.push(
                            {
                                text: 'Create new map',
                                onClick: async () => {
                                    const landscape =
                                        await sdk.landscape.create(
                                            uuidv4(),
                                            '',
                                            {
                                                width: 100,
                                                depth: 100,
                                                height: 5,
                                            },
                                        );
                                    await router.push(
                                        `/account/${activeAccount.value?.username}/map-maker/${landscape.id}`,
                                    );
                                },
                            },
                            {
                                class: 'mt-auto',
                                text: 'Back',
                                href: `/account/${activeAccount.value?.username}/map-maker`,
                            },
                        );
                    }
                    break;
            }
            return items;
        });

        onMounted(async () => {
            await throwable(async () => {
                await sdk.account.get_all();
            });
        });

        return () => (
            <div class="min-w-screen h-screen flex">
                <div class="fixed w-full h-full">
                    <img
                        class="w-full h-full object-cover"
                        src="/login-bg.png"
                        alt="login background"
                    />
                </div>
                <div class={`z-10 relative flex w-full h-full`}>
                    <div
                        class={`flex-shrink-0 flex flex-col gap-2 bg-slate-900 bg-opacity-90 p-8 h-full w-[320px] overflow-auto`}
                    >
                        {activeAccount.value && (
                            <div class={`flex gap-2 text-xs font-light mb-8`}>
                                <div class={`text-gray-500`}>
                                    Active account:
                                </div>
                                <div class={`text-cyan-500`}>
                                    {activeAccount.value.username}
                                </div>
                            </div>
                        )}
                        {navItems.value.map((navItem) => {
                            return (
                                <button
                                    class={`py-4 text-left hover:text-gray-500 ${navItem.class || ''}`}
                                    onClick={async (event) => {
                                        if (navItem.onClick) {
                                            navItem.onClick(event);
                                        } else if (navItem.href) {
                                            await router.push(navItem.href);
                                        }
                                    }}
                                >
                                    {navItem.slot
                                        ? navItem.slot()
                                        : navItem.text}
                                </button>
                            );
                        })}
                    </div>
                    <div class={`h-full w-full overflow-auto`}>
                        {ctx.slots.default ? ctx.slots.default() : ''}
                    </div>
                </div>
            </div>
        );
    },
});
