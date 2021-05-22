import { v4 as uuidv4 } from 'uuid';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import type { Group, Texture, CubeTexture } from 'three';
import type { LoaderHandler, LoaderPrototype } from '../types';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { CubeTextureLoader, TextureLoader } from 'three';

function loader(): LoaderPrototype {
  const fbxLoader = new FBXLoader();
  const gltfLoader = new GLTFLoader();
  const textureLoader = new TextureLoader();
  const cubeTextureLoader = new CubeTextureLoader();
  const subs: {
    [id: string]: LoaderHandler;
  } = {};

  const self: LoaderPrototype = {
    subscribe(handler) {
      const id = uuidv4();
      subs[id] = handler;
      return () => {
        delete subs[id];
      };
    },
    trigger(type, name, loaded) {
      for (const i in subs) {
        try {
          subs[i](type, name, loaded);
        } catch (e) {
          console.error(e);
        }
      }
    },
    async fbx(path: string): Promise<Group> {
      return new Promise<Group>((resolve, reject) => {
        fbxLoader.load(
          path,
          (fbx) => {
            self.trigger('completed', path, 100);
            resolve(fbx);
          },
          (progress) => {
            self.trigger(
              'loading',
              path,
              (progress.loaded / progress.total) * 100
            );
          },
          (err) => {
            self.trigger('completed', path, 100);
            reject(err);
          }
        );
      });
    },
    async gltf(path: string): Promise<GLTF> {
      return new Promise<GLTF>((resolve, reject) => {
        gltfLoader.load(
          path,
          (gltf) => {
            self.trigger('completed', path, 100);
            resolve(gltf);
          },
          (progress) => {
            self.trigger(
              'loading',
              path,
              (progress.loaded / progress.total) * 100
            );
          },
          (err) => {
            self.trigger('completed', path, 100);
            reject(err);
          }
        );
      });
    },
    async texture(path: string): Promise<Texture> {
      return new Promise<Texture>((resolve, reject) => {
        textureLoader.load(
          path,
          (texture) => {
            self.trigger('completed', path, 100);
            resolve(texture);
          },
          (progress) => {
            self.trigger(
              'loading',
              path,
              (progress.loaded / progress.total) * 100
            );
          },
          (err) => {
            self.trigger('completed', path, 100);
            reject(err);
          }
        );
      });
    },
    async cubeTexture(path) {
      return new Promise<CubeTexture>((resolve, reject) => {
        cubeTextureLoader.load(
          path,
          (texture) => {
            self.trigger('completed', path[0], 100);
            resolve(texture);
          },
          (progress) => {
            self.trigger(
              'loading',
              path[0],
              (progress.loaded / progress.total) * 100
            );
          },
          (err) => {
            self.trigger('completed', path[0], 100);
            reject(err);
          }
        );
      });
    },
  };
  return self;
}
export const Loader = loader();
