import {
    FddCharacterEntryMeta,
    FddEnemyEntryMeta,
    FddLayoutEntryMeta,
    FddMapEntryMeta,
} from '../types/bcms';

export interface BCMS {
    maps: FddMapEntryMeta[];
    characters: FddCharacterEntryMeta[];
    enemiesData: FddEnemyEntryMeta[];
    layout: FddLayoutEntryMeta[];
}

let loaded = false;
export const bcms: BCMS = {
    maps: [],
    characters: [],
    enemiesData: [],
    layout: [],
};

export async function loadBcmsData() {
    if (loaded) {
        return;
    }
    const items: Array<{
        key: keyof BCMS;
        name: string;
    }> = [
        {
            key: 'maps',
            name: 'fdd_map.json',
        },
        {
            key: 'characters',
            name: 'fdd_character.json',
        },
        {
            key: 'enemiesData',
            name: 'fdd_enemy.json',
        },
        {
            key: 'layout',
            name: 'fdd_layout.json',
        },
    ];
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const res = await fetch(`/bcms/content/${item.name}`);
        const data = await res.json();
        bcms[item.key] = (data as any[]).map((e) => e.meta.en);
    }
    loaded = true;
}
