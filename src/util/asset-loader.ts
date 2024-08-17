import { v4 as uuidv4 } from 'uuid';
import Axios from 'axios';
import {
    TextureLoader,
    type CubeTexture,
    type Group,
    type Texture,
    CubeTextureLoader,
} from 'three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

export interface AssetLoaderCallbackData {
    type: 'progress' | 'started' | 'done';
    loadedItemsCount: number;
    items: Array<string | string[]>;
    item?: {
        progress: number;
        name: string;
        path: string | string[];
    };
}

export interface AssetLoaderCallback {
    (data: AssetLoaderCallbackData): Promise<void>;
}

export interface AssetLoaderItem {
    path: string | string[];
    name: string;
    type: 'string' | 'fbx' | 'gltf' | 'texture' | 'cubeTexture';
}

export type AssetLoaderOnLoadedData =
    | Group
    | GLTF
    | Texture
    | CubeTexture
    | string;

export interface AssetLoaderOnLoadedCallback {
    (item: AssetLoaderItem, data: AssetLoaderOnLoadedData): Promise<void>;
}

export class AssetLoader {
    private static subs: Array<{
        id: string;
        cb: AssetLoaderCallback;
    }> = [];
    private static onLoadedSubs: Array<{
        id: string;
        cb: AssetLoaderOnLoadedCallback;
    }> = [];
    private static fbxLoader = new FBXLoader();
    private static gltfLoader = new GLTFLoader();
    private static textureLoader = new TextureLoader();
    private static cubeTextureLoader = new CubeTextureLoader();
    private static items: AssetLoaderItem[] = [];
    private static loadedItemsCount = 0;

    private static async trigger(type: 'started' | 'done') {
        for (let i = 0; i < this.subs.length; i++) {
            const sub = this.subs[i];
            await sub.cb({
                items: this.items.map((e) => e.path),
                type,
                loadedItemsCount: this.loadedItemsCount,
            });
        }
    }

    private static async triggerProgress(
        item: AssetLoaderItem,
        progress: number,
    ) {
        for (let i = 0; i < this.subs.length; i++) {
            const sub = this.subs[i];
            await sub.cb({
                items: this.items.map((e) => e.path),
                type: 'progress',
                loadedItemsCount: this.loadedItemsCount,
                item: {
                    path: item.path,
                    name: item.name,
                    progress,
                },
            });
        }
    }

    private static async triggerOnLoaded(
        item: AssetLoaderItem,
        data: AssetLoaderOnLoadedData,
    ) {
        for (let i = 0; i < this.onLoadedSubs.length; i++) {
            const sub = this.onLoadedSubs[i];
            await sub.cb(item, data);
        }
    }

    private static async loadFbx(item: AssetLoaderItem): Promise<Group> {
        await this.triggerProgress(item, 0);
        return new Promise<Group>((resolve, reject) => {
            this.fbxLoader.load(
                item.path as string,
                async (fbx) => {
                    await this.triggerProgress(item, 100);
                    resolve(fbx);
                },
                async (progress) => {
                    await this.triggerProgress(
                        item,
                        (progress.loaded / progress.total) * 100,
                    );
                },
                async (err) => {
                    await this.triggerProgress(item, 100);
                    reject(err);
                },
            );
        });
    }

    private static async loadGltf(item: AssetLoaderItem): Promise<GLTF> {
        await this.triggerProgress(item, 0);
        return new Promise<GLTF>((resolve, reject) => {
            this.gltfLoader.load(
                item.path as string,
                async (gltf) => {
                    await this.triggerProgress(item, 100);
                    resolve(gltf);
                },
                async (progress) => {
                    await this.triggerProgress(
                        item,
                        (progress.loaded / progress.total) * 100,
                    );
                },
                async (err) => {
                    await this.triggerProgress(item, 100);
                    reject(err);
                },
            );
        });
    }

    private static async loadTexture(item: AssetLoaderItem): Promise<Texture> {
        await this.triggerProgress(item, 0);
        return new Promise<Texture>((resolve, reject) => {
            this.textureLoader.load(
                item.path as string,
                async (texture) => {
                    await this.triggerProgress(item, 100);
                    resolve(texture);
                },
                async (progress) => {
                    await this.triggerProgress(
                        item,
                        (progress.loaded / progress.total) * 100,
                    );
                },
                async (err) => {
                    await this.triggerProgress(item, 100);
                    reject(err);
                },
            );
        });
    }

    private static async loadCubeTexture(
        item: AssetLoaderItem,
    ): Promise<CubeTexture> {
        await this.triggerProgress(item, 0);
        return new Promise<CubeTexture>((resolve, reject) => {
            this.cubeTextureLoader.load(
                item.path as string[],
                async (texture) => {
                    await this.triggerProgress(item, 100);
                    resolve(texture);
                },
                async (progress) => {
                    await this.triggerProgress(
                        item,
                        (progress.loaded / progress.total) * 100,
                    );
                },
                async (err) => {
                    await this.triggerProgress(item, 100);
                    reject(err);
                },
            );
        });
    }

    private static async loadString(item: AssetLoaderItem): Promise<string> {
        await this.triggerProgress(item, 0);
        const result = await Axios({
            url: item.path as string,
            method: 'get',
            onDownloadProgress: (progress) => {
                if (progress.total) {
                    this.triggerProgress(
                        item,
                        (progress.loaded / progress.total) * 100,
                    );
                }
            },
        });
        return result.data;
    }

    static subscribe(callback: AssetLoaderCallback): () => void {
        const id = uuidv4();
        this.subs.push({
            id,
            cb: callback,
        });
        return () => {
            for (let i = 0; i < this.subs.length; i++) {
                const sub = this.subs[i];
                if (sub.id === id) {
                    this.subs.splice(i, 1);
                }
            }
        };
    }

    static register(...items: AssetLoaderItem[]): void {
        for (let i = 0; i < items.length; i++) {
            const k = items[i];
            this.items.push(k);
        }
    }

    static onLoaded(callback: AssetLoaderOnLoadedCallback): () => void {
        const id = uuidv4();
        this.onLoadedSubs.push({
            id,
            cb: callback,
        });
        return () => {
            for (let i = 0; i < this.onLoadedSubs.length; i++) {
                const sub = this.onLoadedSubs[i];
                if (sub.id === id) {
                    this.onLoadedSubs.splice(i, 1);
                }
            }
        };
    }

    static async run(): Promise<void> {
        try {
            this.loadedItemsCount = 0;
            await this.trigger('started');
            let loop = true;
            while (loop) {
                const item = this.items.pop();
                if (!item) {
                    loop = false;
                } else {
                    switch (item.type) {
                        case 'fbx':
                            {
                                await this.triggerOnLoaded(
                                    item,
                                    await this.loadFbx(item),
                                );
                            }
                            break;
                        case 'gltf':
                            {
                                await this.triggerOnLoaded(
                                    item,
                                    await this.loadGltf(item),
                                );
                            }
                            break;
                        case 'texture':
                            {
                                await this.triggerOnLoaded(
                                    item,
                                    await this.loadTexture(item),
                                );
                            }
                            break;
                        case 'cubeTexture':
                            {
                                await this.triggerOnLoaded(
                                    item,
                                    await this.loadCubeTexture(item),
                                );
                            }
                            break;
                        case 'string':
                            {
                                await this.triggerOnLoaded(
                                    item,
                                    await this.loadString(item),
                                );
                            }
                            break;
                    }
                    this.loadedItemsCount++;
                }
            }
            await this.trigger('done');
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error(error);
        }
    }

    static destroy() {
        for (const id in this.subs) {
            delete this.subs[id];
        }
        for (const id in this.onLoadedSubs) {
            delete this.onLoadedSubs[id];
        }
    }
}
