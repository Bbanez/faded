import { v4 as uuidv4 } from 'uuid';
import { Mouse } from 'svemir';
import {
  Event,
  Group,
  Intersection,
  Object3D,
  PerspectiveCamera,
  Raycaster,
  Vector2,
} from 'three';

export interface MouseState {
  left: boolean;
  middle: boolean;
  right: boolean;
  x: number;
  y: number;
  delta: {
    x: number;
    y: number;
  };
}

// eslint-disable-next-line no-shadow
export enum MouseEventType {
  MOUSE_DOWN = 'MOUSE_DOWN',
  MOUSE_UP = 'MOUSE_UP',
  MOUSE_MOVE = 'MOUSE_MOVE',
  ALL = 'ALL',
}
export interface MouseEventCallback {
  (state: MouseState, event: MouseEvent): void;
}

export interface MouseSubscription {
  [id: string]: MouseEventCallback;
}

export interface MouseUnsubscribe {
  (): void;
}

export class MouseRay {
  private unsubs: Array<MouseUnsubscribe> = [];
  private ray = new Raycaster();
  private subs: {
    [id: string]: (intersections: Intersection<Object3D<Event>>[]) => void;
  } = {};

  constructor(
    private cam: PerspectiveCamera,
    private objects: Object3D[] | Group,
  ) {
    this.unsubs.push(
      Mouse.subscribe(MouseEventType.MOUSE_DOWN, (state) => {
        if (state.left) {
          const pointer = {
            x: 0,
            y: 0,
          };
          pointer.x = (state.x / window.innerWidth) * 2 - 1;
          pointer.y = -(state.y / window.innerHeight) * 2 + 1;
          this.ray.setFromCamera(new Vector2(pointer.x, pointer.y), this.cam);
          const res =
            this.objects instanceof Array
              ? this.ray.intersectObjects(this.objects)
              : this.ray.intersectObject(this.objects);
          for (const id in this.subs) {
            const sub = this.subs[id];
            sub(res);
          }
        }
      }),
    );
  }

  subscribe(
    callback: (intersections: Intersection<Object3D<Event>>[]) => void,
  ): () => void {
    const id = uuidv4();
    this.subs[id] = callback;
    return () => {
      delete this.subs[id];
    };
  }

  async destroy() {
    for (const id in this.subs) {
      delete this.subs[id];
    }
  }
}
