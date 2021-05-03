import type { Group } from 'three';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

export type LoaderHandlerType = 'loading' | 'completed';
export type LoaderHandler = (
  type: LoaderHandlerType,
  name: string,
  loaded: number
) => void;
export interface LoaderPrototype {
  subscribe(handler: LoaderHandler): () => void;
  trigger(type: LoaderHandlerType, name: string, loaded: number): void;
  fbx(path: string): Promise<Group>;
  gltf(path: string): Promise<GLTF>;
}
