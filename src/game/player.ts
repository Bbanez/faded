import {
  BoxGeometry,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  Raycaster,
  Vector3,
} from 'three';
import { Assets } from './assets';
import type { Camera, PlayerConfig, PlayerCreateConfig } from './types';
import { Entity, Keyboard, Mouse, PI12, Scene, Ticker } from 'svemir';
import { KeyboardEventType, KeyboardState, MouseEventType } from 'svemir/types';

type Move = 1 | -1 | 0;

export class Player extends Entity {
  private unsub: Array<() => void> = [];
  private ray = new Raycaster();
  private yRayDir = new Vector3(0, -1, 0);
  private speed = 0.1;
  private movePlane: Mesh;
  private dash: {
    active: boolean;
    multi: number;
    multiMax: number;
    ticks: number;
    ticksTo: number;
    count: number;
    countMax: number;
    countTicks: number;
    countTicksTo: number;
  } = {
    active: false,
    multi: 1,
    multiMax: 8,
    count: 0,
    countMax: 2,
    countTicks: 0,
    countTicksTo: 120,
    ticks: 0,
    ticksTo: 8,
  };
  private move: {
    x: Move;
    z: Move;
  } = {
    x: 0,
    z: 0,
  };

  public cam?: Camera;

  constructor(config: PlayerConfig) {
    super(config);
    this.dash.count = this.dash.countMax;
    const height = this.bb.max.y - this.bb.min.y;
    this.obj.position.y = height / 2;
    let mouseMoveDebounce: NodeJS.Timeout;
    this.movePlane = new Mesh(
      new PlaneGeometry(100, 100),
      new MeshStandardMaterial({
        color: 0xffffff,
        opacity: 0,
        transparent: true,
      }),
    );
    this.movePlane.rotation.x = -PI12;
    Scene.scene.add(this.movePlane);
    this.unsub.push(
      Ticker.subscribe(() => {
        this.calcYPosition();
      }),
      Keyboard.subscribe(KeyboardEventType.KEY_DOWN, (state) => {
        if (state.shift) {
          if (this.dash.count > 0) {
            this.dash.count--;
            this.dash.active = true;
            this.dash.ticks = 0;
            this.dash.multi = this.dash.multiMax;
          }
        }
        this.setMove(state);
      }),
      Keyboard.subscribe(KeyboardEventType.KEY_UP, (state) => {
        this.setMove(state);
      }),
      Mouse.subscribe(MouseEventType.MOUSE_MOVE, (state) => {
        clearTimeout(mouseMoveDebounce);
        mouseMoveDebounce = setTimeout(() => {
          if (this.cam) {
            const pointer = {
              x: 0,
              y: 0,
            };
            pointer.x = (state.x / window.innerWidth) * 2 - 1;
            pointer.y = -(state.y / window.innerHeight) * 2 + 1;
            this.ray.setFromCamera(pointer, this.cam.cam);
            const inters = this.ray.intersectObject(this.movePlane);
            if (inters[0]) {
              const inter = inters[0];
              const rx = inter.point.x - this.obj.position.x;
              const rz = inter.point.z - this.obj.position.z;
              const d = Math.sqrt(rx * rx + rz * rz);
              const theta = Math.acos(rx / d);
              if (!isNaN(theta)) {
                this.obj.rotation.y = rz < 0 ? theta : -theta;
              }
            }
          }
        }, 5);
      }),
    );
  }

  private setMove(state: KeyboardState) {
    if (state.w) {
      this.move.x = 1;
    } else if (state.s) {
      this.move.x = -1;
    } else {
      this.move.x = 0;
    }
    if (state.a) {
      this.move.z = -1;
    } else if (state.d) {
      this.move.z = 1;
    } else {
      this.move.z = 0;
    }
  }

  private calcYPosition() {
    this.ray.set(
      new Vector3(this.obj.position.x, 100, this.obj.position.z),
      this.yRayDir,
    );
    const intersect = this.ray.intersectObject(Assets.map.scene, true);
    if (intersect[0]) {
      const heightOffset = (this.bb.max.y - this.bb.min.y) / 2;
      this.obj.position.y = intersect[0].point.y + heightOffset;
    }
    const newPosition = [0, 0];
    if (this.move.x !== 0) {
      newPosition[0] = this.move.x * this.speed * this.dash.multi;
    }
    if (this.move.z !== 0) {
      newPosition[1] = this.move.z * this.speed * this.dash.multi;
    }
    if (newPosition[0] !== 0 && newPosition[1] !== 0) {
      newPosition[0] /= 1.4;
      newPosition[1] /= 1.4;
    }
    this.obj.translateX(newPosition[0]);
    this.obj.translateZ(newPosition[1]);
    this.movePlane.position.x = this.obj.position.x;
    this.movePlane.position.z = this.obj.position.z;
    this.movePlane.position.y = this.obj.position.y;
    if (this.dash.countTicks <= this.dash.countTicksTo && !this.dash.active) {
      this.dash.countTicks++;
    } else if (this.dash.countTicks > this.dash.countTicksTo) {
      this.dash.countTicks = 0;
      if (this.dash.count < this.dash.countMax) {
        this.dash.count++;
      }
    }
    if (this.dash.active) {
      this.dash.ticks++;
      if (this.dash.ticks > this.dash.ticksTo) {
        this.dash.ticks = 0;
        this.dash.multi = 1;
        this.dash.active = false;
      }
    }
  }

  async destroy() {
    this.unsub.forEach((f) => f());
  }
}

export async function createPlayer(
  _config: PlayerCreateConfig,
): Promise<Player> {
  const player = new Mesh(
    new BoxGeometry(1, 3, 2),
    new MeshStandardMaterial({
      color: 0xaa9900,
    }),
  );
  player.position.set(110, 0, 285);
  player.castShadow = true;
  player.receiveShadow = true;
  Scene.scene.add(player);

  return new Player({
    obj: player,
  });
}
