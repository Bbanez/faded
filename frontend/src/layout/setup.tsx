import { defineComponent, PropType } from 'vue';
import type { JSX } from 'vue/jsx-runtime';
import { PageNames, useRouter } from '../router';

export interface SetupNavItem {
    text: string;
    slot?: () => JSX.Element;
    class?: string;
    href?: PageNames;
    onClick?(event: Event): void | Promise<void>;
}

export const SetupLayout = defineComponent({
    props: {
        navItems: {
            type: Array as PropType<SetupNavItem[]>,
            required: true,
        },
    },
    setup(props, ctx) {
        const router = useRouter();

        return () => (
            <div class="min-w-screen min-h-screen flex">
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
                        {props.navItems.map((navItem) => {
                            return (
                                <button
                                    class={navItem.class}
                                    onClick={(event) => {
                                        if (navItem.onClick) {
                                            navItem.onClick(event);
                                        } else if (navItem.href) {
                                            router.push(navItem.href);
                                        }
                                    }}
                                >
                                    {navItem.slot ? navItem.slot() : navItem.text}
                                </button>
                            );
                        })}
                    </div>
                    <div class={`h-full`}>{ctx.slots.default ? ctx.slots.default() : ''}</div>
                </div>
            </div>
        );
    },
});
