import { v4 as uuidv4 } from 'uuid';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import type { Group } from 'three';
import type { LoaderHandler, LoaderPrototype } from '../types';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

function loader(): LoaderPrototype {
  const fbxLoader = new FBXLoader();
  const gltfLoader = new GLTFLoader();
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
          window.t.services.console.error({ payload: e });
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
  };
  return self;
}
export const Loader = loader();
