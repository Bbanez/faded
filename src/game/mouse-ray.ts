import { v4 as uuidv4 } from 'uuid';
import { Group, Raycaster } from 'three';
import type { PerspectiveCamera, Intersection, Object3D, Event } from 'three';
import { MouseEventType } from 'svemir/types';
import type { MouseUnsubscribe } from 'svemir/types';
import { Mouse } from 'svemir';

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
        const pointer = {
          x: 0,
          y: 0,
        };
        pointer.x = (state.x / window.innerWidth) * 2 - 1;
        pointer.y = -(state.y / window.innerHeight) * 2 + 1;
        this.ray.setFromCamera(pointer, this.cam);
        const res =
          this.objects instanceof Array
            ? this.ray.intersectObjects(this.objects)
            : this.ray.intersectObject(this.objects);
        for (const id in this.subs) {
          const sub = this.subs[id];
          sub(res);
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
