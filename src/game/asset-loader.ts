import { v4 as uuidv4 } from 'uuid';
import Axios from 'axios';
import type { CubeTexture, Group, Texture } from 'three';
import { CubeTextureLoader, TextureLoader } from 'three';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

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
  (data: AssetLoaderCallbackData): void;
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
  (item: AssetLoaderItem, data: AssetLoaderOnLoadedData): void;
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

  private static trigger(type: 'started' | 'done') {
    for (let i = 0; i < this.subs.length; i++) {
      const sub = this.subs[i];
      sub.cb({
        items: this.items.map((e) => e.path),
        type,
        loadedItemsCount: this.loadedItemsCount,
      });
    }
  }

  private static triggerProgress(item: AssetLoaderItem, progress: number) {
    for (let i = 0; i < this.subs.length; i++) {
      const sub = this.subs[i];
      sub.cb({
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

  private static triggerOnLoaded(
    item: AssetLoaderItem,
    data: AssetLoaderOnLoadedData
  ) {
    for (let i = 0; i < this.onLoadedSubs.length; i++) {
      const sub = this.onLoadedSubs[i];
      sub.cb(item, data);
    }
  }

  private static async loadFbx(item: AssetLoaderItem): Promise<Group> {
    this.triggerProgress(item, 0);
    return new Promise<Group>((resolve, reject) => {
      this.fbxLoader.load(
        item.path as string,
        (fbx) => {
          this.triggerProgress(item, 100);
          resolve(fbx);
        },
        (progress) => {
          this.triggerProgress(item, (progress.loaded / progress.total) * 100);
        },
        (err) => {
          this.triggerProgress(item, 100);
          reject(err);
        }
      );
    });
  }

  private static async loadGltf(item: AssetLoaderItem): Promise<GLTF> {
    this.triggerProgress(item, 0);
    return new Promise<GLTF>((resolve, reject) => {
      this.gltfLoader.load(
        item.path as string,
        (gltf) => {
          this.triggerProgress(item, 100);
          resolve(gltf);
        },
        (progress) => {
          this.triggerProgress(item, (progress.loaded / progress.total) * 100);
        },
        (err) => {
          this.triggerProgress(item, 100);
          reject(err);
        }
      );
    });
  }

  private static async loadTexture(item: AssetLoaderItem): Promise<Texture> {
    this.triggerProgress(item, 0);
    return new Promise<Texture>((resolve, reject) => {
      this.textureLoader.load(
        item.path as string,
        (texture) => {
          this.triggerProgress(item, 100);
          resolve(texture);
        },
        (progress) => {
          this.triggerProgress(item, (progress.loaded / progress.total) * 100);
        },
        (err) => {
          this.triggerProgress(item, 100);
          reject(err);
        }
      );
    });
  }

  private static async loadCubeTexture(
    item: AssetLoaderItem
  ): Promise<CubeTexture> {
    this.triggerProgress(item, 0);
    return new Promise<CubeTexture>((resolve, reject) => {
      this.cubeTextureLoader.load(
        item.path as string[],
        (texture) => {
          this.triggerProgress(item, 100);
          resolve(texture);
        },
        (progress) => {
          this.triggerProgress(item, (progress.loaded / progress.total) * 100);
        },
        (err) => {
          this.triggerProgress(item, 100);
          reject(err);
        }
      );
    });
  }

  private static async loadString(item: AssetLoaderItem): Promise<string> {
    this.triggerProgress(item, 0);
    const result = await Axios({
      url: item.path as string,
      method: 'get',
      onDownloadProgress: (progress) => {
        if (progress.total) {
          this.triggerProgress(item, (progress.loaded / progress.total) * 100);
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
      this.trigger('started');
      let loop = true;
      while (loop) {
        const item = this.items.pop();
        if (!item) {
          loop = false;
        } else {
          switch (item.type) {
            case 'fbx':
              {
                this.triggerOnLoaded(item, await this.loadFbx(item));
              }
              break;
            case 'gltf':
              {
                this.triggerOnLoaded(item, await this.loadGltf(item));
              }
              break;
            case 'texture':
              {
                this.triggerOnLoaded(item, await this.loadTexture(item));
              }
              break;
            case 'cubeTexture':
              {
                this.triggerOnLoaded(item, await this.loadCubeTexture(item));
              }
              break;
            case 'string':
              {
                this.triggerOnLoaded(item, await this.loadString(item));
              }
              break;
          }
          this.loadedItemsCount++;
        }
      }
      this.trigger('done');
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
