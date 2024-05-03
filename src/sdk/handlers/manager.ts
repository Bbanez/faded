import { api_call } from '../../rust/api-call.ts';
import { Manager } from '../../types/rs';
import { createArrayStore } from '@banez/vue-array-store';
import { AssetLoader } from '../../game/asset-loader.ts';
import { Texture } from 'three';
import { getImageData } from '../../game/util/image.ts';

export class ManagerHandler {
    private rust_create = api_call<
        { mapId: string; characterId: string; pixels: number[] },
        Manager
    >('manager_create');
    private rust_get = api_call<{ managerId: string }, Manager>('manager_get');

    store = createArrayStore<Manager>('id', []);

    async get(managerId: string) {
        const cacheHit = this.store.findById(managerId);
        if (cacheHit) {
            return cacheHit;
        }
        const manager = await this.rust_get({ managerId });
        this.store.set(manager);
        return manager;
    }

    async create(mapId: string, characterId: string) {
        const pixels: number[] = [];
        AssetLoader.register({
            name: 'nogo',
            path: `/assets/maps/${mapId}/nogo.jpg`,
            type: 'texture',
        });
        const loaderUnsub = AssetLoader.onLoaded(async (item, data) => {
            if (item.name === 'nogo') {
                const imageData = getImageData(data as Texture);
                for (let i = 0; i < imageData.data.length; i += 4) {
                    const pixel = imageData.data[i];
                    pixels.push(pixel);
                }
            }
        });
        await AssetLoader.run();
        loaderUnsub();
        const res = await this.rust_create({
            characterId,
            mapId,
            pixels,
        });
        this.store.set(res);
        return res;
    }
}
