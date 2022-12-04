import {
  AnimationAction,
  AnimationMixer,
  Group,
  LoopOnce,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  PlaneGeometry,
  Raycaster,
  SkeletonHelper,
  Vector3,
} from 'three';
import type {
  Camera,
  PlayerConfig,
  PlayerCreateConfig,
  PlayerModel,
} from './types';
import {
  Entity,
  FunctionBuilder,
  Keyboard,
  Loader,
  Mouse,
  PI12,
  Scene,
  Ticker,
} from 'svemir';
import { KeyboardEventType, KeyboardState, MouseEventType } from 'svemir/types';
import { Panel } from './panel';

type Move = 1 | -1 | 0;

interface Animations {
  fRoll: AnimationAction;
  main: AnimationAction;
  idle: AnimationAction;
  sRun: AnimationAction;
  back: AnimationAction;
  left: AnimationAction;
  right: AnimationAction;
}

export class Player extends Entity {
  private unsub: Array<() => void> = [];
  private movePlane: Mesh;
  private ray = new Raycaster();
  private yRayDir = new Vector3(0, -1, 0);
  private speed = 0.09;
  private animSpeedFn = FunctionBuilder.linear2D([
    [0, 0],
    [this.speed, 1],
  ]);
  private ground: Object3D | Group | Mesh;
  private animMixer: AnimationMixer;
  private anims: Animations = {} as never;
  private activeAnim: keyof Animations = 'idle';
  private rollAnim = {
    scale: 1.7,
    fadeIn: 0.1,
    fadeOut: 0.6,
    time: 0.2,
  };
  private skeleton;
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
    multiMax: 5.6,
    count: 0,
    countMax: 2,
    countTicks: 0,
    countTicksTo: 120,
    ticks: 0,
    ticksTo: 30,
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
    this.obj.traverse((e) => {
      e.castShadow = true;
    });
    Scene.scene.add(this.obj);
    this.ground = config.ground;
    this.skeleton = new SkeletonHelper(this.obj);
    const bra = this.obj.children[this.obj.children.length - 1];
    bra.position.set(100, 100, 100000);
    this.animMixer = new AnimationMixer(this.obj);
    for (const _name in config.model) {
      const name = _name as keyof Animations;
      const anim = config.model[name as keyof PlayerModel].animations[0];
      if (anim) {
        this.anims[name] = this.animMixer.clipAction(anim);
        this.anims[name].timeScale = this.animSpeedFn(this.speed);
      }
    }
    this.anims.idle.reset();
    this.anims.idle.fadeIn(0.2);
    this.anims.idle.play();
    this.anims.fRoll.timeScale = this.rollAnim.scale;
    this.anims.fRoll.setLoop(LoopOnce, 1);
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
    const sec = 1 / 60;
    this.unsub.push(
      Ticker.subscribe((_t) => {
        this.calcYPosition();
        this.animMixer.update(sec);
      }),
    );
    if (!config.disableControls) {
      this.unsub.push(
        Keyboard.subscribe(KeyboardEventType.KEY_DOWN, (state) => {
          if (state.shift) {
            if (
              this.dash.count > 0 &&
              !this.dash.active &&
              (this.move.x !== 0 || this.move.z !== 0)
            ) {
              this.dash.count--;
              this.dash.active = true;
              this.dash.ticks = 0;
              this.dash.multi = this.dash.multiMax;
              this.anims[this.activeAnim].stop();
              this.anims.fRoll.reset();
              this.anims.fRoll.fadeIn(this.rollAnim.fadeIn);
              this.anims.fRoll.time = this.rollAnim.time;
              // this.anims.fRoll.fadeOut(this.rollAnim.fadeOut);
              this.anims.fRoll.play();
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
                  this.obj.rotation.y = rz < 0 ? theta + PI12 : -theta + PI12;
                }
              }
            }
          }, 5);
        }),
      );
    }
    Panel.addGroup({
      name: 'Player',
      extended: false,
      items: [
        {
          name: 'Speed',
          type: 'input',
          value: this.speed,
          range: [0.01, 1, 0.01],
          onChange: (value) => {
            this.speed = value;
            for (const _name in this.anims) {
              const name = _name as keyof Animations;
              if (name !== 'fRoll') {
                this.anims[name].timeScale = this.animSpeedFn(value);
              }
            }
          },
        },
      ],
      groups: [
        {
          name: 'Dash',
          extended: true,
          items: [
            {
              name: 'Multi',
              type: 'input',
              value: this.dash.multi,
              range: [1, 15, 0.1],
              onChange: (value) => {
                this.dash.multi = value;
              },
            },
            {
              name: 'Multi max',
              type: 'input',
              value: this.dash.multiMax,
              range: [1, 15, 0.1],
              onChange: (value) => {
                this.dash.multiMax = value;
              },
            },
            {
              name: 'Count max',
              type: 'input',
              value: this.dash.countMax,
              range: [1, 15, 0.1],
              onChange: (value) => {
                this.dash.countMax = value;
              },
            },
            {
              name: 'Inc. count after X ticks',
              type: 'input',
              value: this.dash.countTicksTo,
              onChange: (value) => {
                this.dash.countTicksTo = value;
              },
            },
            {
              name: 'Dash for X ticks',
              type: 'input',
              value: this.dash.ticksTo,
              onChange: (value) => {
                this.dash.ticksTo = value;
              },
            },
          ],
          groups: [
            {
              name: 'Roll animation',
              extended: true,
              items: [
                {
                  name: 'Scale',
                  type: 'input',
                  value: this.rollAnim.scale,
                  range: [0, 5, 0.1],
                  onChange: (value) => {
                    this.rollAnim.scale = value;
                    this.anims.fRoll.timeScale = this.rollAnim.scale;
                  },
                },
                {
                  name: 'Fade in',
                  type: 'input',
                  value: this.rollAnim.fadeIn,
                  range: [0, 2, 0.01],
                  onChange: (value) => {
                    this.rollAnim.fadeIn = value;
                    this.anims.fRoll.fadeIn(this.rollAnim.fadeIn);
                  },
                },
                {
                  name: 'Fade out',
                  type: 'input',
                  value: this.rollAnim.fadeOut,
                  range: [0, 2, 0.01],
                  onChange: (value) => {
                    this.rollAnim.fadeOut = value;
                    this.anims.fRoll.fadeOut(this.rollAnim.fadeOut);
                  },
                },
                {
                  name: 'Time',
                  type: 'input',
                  value: this.rollAnim.time,
                  range: [0, 15, 0.1],
                  onChange: (value) => {
                    this.rollAnim.time = value;
                    this.anims.fRoll.time = this.rollAnim.time;
                  },
                },
              ],
            },
          ],
        },
      ],
    });
    this.setMove({});
  }

  private setMove(state: KeyboardState) {
    let activeAnim = this.activeAnim;
    if (state.w) {
      this.move.z = 1;
      activeAnim = 'sRun';
    } else if (state.s) {
      this.move.z = -1;
      activeAnim = 'back';
    } else {
      this.move.z = 0;
    }
    if (state.a) {
      this.move.x = 1;
      activeAnim = 'left';
    } else if (state.d) {
      this.move.x = -1;
      activeAnim = 'right';
    } else {
      this.move.x = 0;
    }
    if (this.move.x === 0 && this.move.z === 0) {
      activeAnim = 'idle';
    }
    if (activeAnim !== this.activeAnim) {
      if (this.dash.active) {
        this.activeAnim = activeAnim;
      } else {
        console.log('Gere', this.activeAnim, activeAnim);
        this.anims[this.activeAnim].fadeOut(0.2);
        this.activeAnim = activeAnim;
        this.anims[this.activeAnim].reset();
        this.anims[this.activeAnim].fadeIn(0.2);
        this.anims[this.activeAnim].play();
      }
    }
  }

  private calcYPosition() {
    this.ray.set(
      new Vector3(this.obj.position.x, 100, this.obj.position.z),
      this.yRayDir,
    );
    const intersect = this.ray.intersectObject(this.ground, true);
    if (intersect[0]) {
      // const heightOffset = (this.bb.max.y - this.bb.min.y) / 2;
      this.obj.position.y = intersect[0].point.y;
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
        // this.anims.fRoll.stop();
        this.anims[this.activeAnim].reset();
        this.anims[this.activeAnim].play();
      }
    }
    // const bra = this.obj.children[this.obj.children.length - 1];
    // bra.applyMatrix4(new Matrix4().makeTranslation(-1, -1, -1));
  }

  async destroy() {
    this.unsub.forEach((f) => f());
    Scene.scene.remove(this.obj);
  }
}

const playerModel: PlayerModel = {} as never;
export async function createPlayer(
  _config: PlayerCreateConfig,
): Promise<Player> {
  // const player = new Mesh(
  //   new BoxGeometry(1, 3, 2),
  //   new MeshStandardMaterial({
  //     color: 0xaa9900,
  //   }),
  // );
  Loader.register([
    {
      type: 'fbx',
      name: 'char_main',
      path: '/assets/character/bot/main.fbx',
    },
    {
      type: 'fbx',
      name: 'char_idle',
      path: '/assets/character/bot/idle.fbx',
    },
    {
      type: 'fbx',
      name: 'char_sRun',
      path: '/assets/character/bot/s-run.fbx',
    },
    {
      type: 'fbx',
      name: 'char_back',
      path: '/assets/character/bot/back.fbx',
    },
    {
      type: 'fbx',
      name: 'char_left',
      path: '/assets/character/bot/left.fbx',
    },
    {
      type: 'fbx',
      name: 'char_right',
      path: '/assets/character/bot/right.fbx',
    },
    {
      type: 'fbx',
      name: 'char_fRoll',
      path: '/assets/character/bot/f-roll.fbx',
    },
  ]);
  const loaderUnsub = Loader.onLoaded((item, data) => {
    if (item.name.startsWith('char_')) {
      playerModel[item.name.replace('char_', '') as keyof PlayerModel] =
        data as Group;
    }
  });
  await Loader.run();
  loaderUnsub();
  const player = playerModel.main;
  player.traverse((c) => {
    c.castShadow = true;
  });
  player.scale.setScalar(0.02);
  player.position.set(0, 0, 0);

  return new Player({
    obj: player,
    model: playerModel,
    ground: _config.ground,
    disableControls: _config.disableControls,
  });
}
