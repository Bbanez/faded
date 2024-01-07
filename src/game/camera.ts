import { PerspectiveCamera } from 'three';
import { degToRad } from 'three/src/math/MathUtils';
import { Distance } from './distance';
import { FunctionBuilder } from './math';
import { Mouse, MouseEventType } from './mouse';
import { PI12, PI_2 } from './consts';
import { Game } from './main';
import { Ticker } from './ticker';
import { Player } from './player';

export class Camera {
  cam: PerspectiveCamera;
  followObj: Player | null = null;
  position: {
    //     x       y .     z
    curr: [number, number, number];
    //       x .     y .     z
    wanted: [number, number, number];
  } = {
    curr: [0, 0, 0],
    wanted: [0, 0, 0],
  };
  alpha: {
    curr: number;
    old: number;
  } = {
    curr: -PI12,
    old: 0,
  };
  fi = degToRad(45);

  private angleChangeFn = FunctionBuilder.linear2D([
    [0, 0],
    [window.innerWidth / 2, PI_2],
  ]);
  private distanceChangeFn = FunctionBuilder.linear2D([
    [0, 0],
    [0, 0],
  ]);
  private unsubs: Array<() => void> = [];
  // ---- Camera distance ----
  //          min
  //           |  max
  //           |  |   curr
  private D = [1, 150, 5];

  constructor(
    private game: Game,
    /**
     *          x       z
     */
    position?: [number, number],
  ) {
    this.cam = new PerspectiveCamera(undefined, undefined, 0.01, 1000);
    if (position) {
      this.position.curr = [
        position[0],
        Distance.heightTo(position, this.game.assets.ground),
        position[1],
      ];
      this.position.wanted = [...this.position.curr];
    }
    window.addEventListener('resize', () => {
      this.angleChangeFn = FunctionBuilder.linear2D([
        [0, 0],
        [window.innerWidth / 2, PI12],
      ]);
    });
    this.unsubs.push(
      Mouse.subscribe(MouseEventType.MOUSE_DOWN, async (state) => {
        if (state.middle) {
          this.distanceChangeFn = FunctionBuilder.linear2D([
            [0, this.D[0]],
            [state.y, this.D[2]],
            [window.innerHeight, this.D[1]],
          ]);
          this.angleChangeFn = FunctionBuilder.linear2D([
            [state.x, 0],
            [state.x + window.innerWidth / 2, PI12],
          ]);
          this.alpha.old = this.alpha.curr;
        }
      }),
      Mouse.subscribe(MouseEventType.MOUSE_UP, (state) => {
        if (!state.middle) {
          this.alpha.old = this.alpha.curr;
        }
      }),
      Mouse.subscribe(MouseEventType.MOUSE_MOVE, (state, event) => {
        event.preventDefault();
        if (state.middle) {
          const alphaDelta = this.angleChangeFn(state.x);
          this.alpha.curr = this.alpha.old + alphaDelta;
          this.D[2] = this.distanceChangeFn(state.y);
        }
      }),
      Ticker.subscribe(async () => {
        this.update();
      }),
    );
    this.calcPosition();
  }

  private calcPosition() {
    if (this.followObj) {
      if (
        this.position.wanted[0] !== this.followObj.rust.obj.position[0] ||
        this.position.wanted[2] !== this.followObj.rust.obj.position[1]
      ) {
        this.position.wanted = [
          this.followObj.rust.obj.position[0],
          Distance.heightTo(
            this.followObj.rust.obj.position,
            this.game.assets.ground,
          ),
          this.followObj.rust.obj.position[1],
        ];
      }
    }
    if (
      this.position.wanted[0] !== this.position.curr[0] ||
      this.position.wanted[1] !== this.position.curr[1] ||
      this.position.wanted[2] !== this.position.curr[2] ||
      this.alpha.curr !== this.alpha.old
    ) {
      const dx = (this.position.wanted[0] - this.position.curr[0]) / 10;
      const dy = (this.position.wanted[1] - this.position.curr[1]) / 10;
      const dz = (this.position.wanted[2] - this.position.curr[2]) / 10;
      this.position.curr[0] += dx;
      this.position.curr[1] += dy;
      this.position.curr[2] += dz;
      const d = this.D[2] * Math.cos(this.fi);
      const y = this.D[2] * Math.sin(this.fi);
      const x = d * Math.cos(this.alpha.curr);
      const z = d * Math.sin(this.alpha.curr);
      if (this.alpha.curr) {
        this.cam.position.x = this.position.curr[0] - x;
      }
      this.cam.position.y = this.position.curr[1] + y;
      this.cam.position.z = this.position.curr[2] - z;
    }
  }

  setWantedPosition(position: [number, number]) {
    this.position.wanted = [
      position[0],
      Distance.heightTo(position, this.game.assets.ground),
      position[1],
    ];
  }

  setPosition(position: [number, number]) {
    this.followObj = null;
    this.position.curr = [
      position[0],
      Distance.heightTo(position, this.game.assets.ground),
      position[1],
    ];
    this.position.wanted = [...this.position.curr];
  }

  follow(obj: Player | null) {
    this.followObj = obj;
  }

  update() {
    this.calcPosition();
    this.cam.lookAt(...this.position.curr);
  }

  destroy() {
    while (this.unsubs.length > 0) {
      const unsub = this.unsubs.pop();
      if (unsub) {
        unsub();
      }
    }
  }
}
