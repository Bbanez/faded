import { api_call } from '../../rust/api-call.ts';
import type { Character, Map } from '../../types/rs';
import { createArrayStore } from '@banez/vue-array-store';

export interface MapExtended extends Map {
    description: string;
}

export interface CharacterExtended extends Character {
    description: string;
}

export class DataHandler {
    private rust_maps = api_call<void, Map[]>('data_maps');
    private rust_characters = api_call<void, Character[]>('data_characters');

    mapStore = createArrayStore<MapExtended>('id', []);
    characterStore = createArrayStore<CharacterExtended>('id', []);

    async maps() {
        if (this.mapStore.items().length === 0) {
            const items = await this.rust_maps();
            for (let i = 0; i < items.length; i++) {
                const res = await fetch(
                    `/assets/maps/${items[i].id}/description.md`,
                );
                this.mapStore.set({
                    ...items[i],
                    description: await res.text(),
                });
            }
        }
        return this.mapStore.items();
    }

    async characters() {
        if (this.characterStore.items().length === 0) {
            const items = await this.rust_characters();
            for (let i = 0; i < items.length; i++) {
                const res = await fetch(
                    `/assets/characters/${items[i].id}/description.md`,
                );
                this.characterStore.set({
                    ...items[i],
                    description: await res.text(),
                });
            }
        }
        return this.characterStore.items();
    }
}
