import { PerspectiveCamera } from 'three';
import { degToRad } from 'three/src/math/MathUtils';
import { Distance } from './distance';
import { FunctionBuilder } from './math';
import { Mouse, MouseEventType } from './mouse';
import { PI12 } from './consts';
import { Game } from './main';
import { Ticker } from './ticker';

export interface Camera {
  cam: PerspectiveCamera;
  follow: boolean;

  setPosition(point: [number, number]): void;
  update(): void;
  destroy(): void;
}

export function createCamera(
  game: Game,
  config: {
    initPosition: [number, number];
  }
): Camera {
  let mouseX: number = 0;
  const mouseDistanceFn = FunctionBuilder.linear2D([
    [0, 0],
    [window.innerWidth / 2, 2 * Math.PI],
  ]);
  const unsubs: Array<() => void> = [
    Mouse.subscribe(MouseEventType.MOUSE_DOWN, (state) => {
      mouseX = state.x;
      if (state.left) {
        alphaOld = alpha;
      }
    }),
    Mouse.subscribe(MouseEventType.MOUSE_UP, (state) => {
      mouseX = state.x;
      if (!state.middle) {
        alphaOld = alpha;
      }
    }),
    Mouse.subscribe(MouseEventType.MOUSE_MOVE, (state, event) => {
      event.preventDefault();
      if (state.middle && mouseX) {
        const alphaDelta = mouseDistanceFn(state.x - mouseX);
        alpha = alphaOld + alphaDelta;
      }
    }),
    Ticker.subscribe(() => {
      self.update();
    }),
  ];
  //        min
  //         |  max
  //         |   |  curr
  const D = [1, 5, 5];
  const fi = degToRad(35);
  let alphaOld = -PI12;
  let alpha = -PI12;
  const currentPosition = [
    config.initPosition[0],
    Distance.heightTo(config.initPosition, game.assets.ground),
    config.initPosition[1],
  ];
  const wantedPosition = [
    currentPosition[0] - 0.0001,
    currentPosition[1],
    currentPosition[2],
  ];
  const camera = new PerspectiveCamera(undefined, undefined, 0.01, 1000);

  function calcPosition() {
    if (
      wantedPosition[0] !== currentPosition[0] ||
      wantedPosition[1] !== currentPosition[1] ||
      wantedPosition[2] !== currentPosition[2] ||
      alpha !== alphaOld
    ) {
      const dx = (wantedPosition[0] - currentPosition[0]) / 10;
      const dy = (wantedPosition[1] - currentPosition[1]) / 10;
      const dz = (wantedPosition[2] - currentPosition[2]) / 10;
      currentPosition[0] += dx;
      currentPosition[1] += dy;
      currentPosition[2] += dz;
      const d = D[2] * Math.cos(fi);
      const y = D[2] * Math.sign(fi);
      const x = d * Math.cos(alpha);
      const z = d * Math.sin(alpha);
      if (alpha) camera.position.x = currentPosition[0] - x;
      camera.position.y = currentPosition[1] + y;
      camera.position.z = currentPosition[2] - z;
    }
  }
  calcPosition();

  const self: Camera = {
    cam: camera,
    follow: true,

    setPosition(location: [number, number]) {
      wantedPosition[0] = location[0];
      wantedPosition[2] = location[1];
      wantedPosition[1] = Distance.heightTo(location, game.assets.ground);
    },

    update() {
      calcPosition();
      camera.lookAt(currentPosition[0], currentPosition[1], currentPosition[2]);
    },

    destroy() {
      unsubs.forEach((e) => e());
    },
  };
  self.update();

  return self;
}
