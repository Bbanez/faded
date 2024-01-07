import { Group } from 'three';
import { Animation, AnimationConfigItem } from './animation';
import { Game } from './main';
import { bcms } from './bcms';
import { AssetLoader } from './asset-loader';
import { RustPlayer } from '../types';
import { invoke } from '@tauri-apps/api';
import { MouseRay } from './mouse-ray';
import { Keyboard, KeyboardEventType, KeyboardState } from './keyboard';
import { Distance } from './distance';
import { Ticker } from './ticker';
import { PI12 } from './consts';

export interface PlayerAnimation {
  idle: AnimationConfigItem;
  death: AnimationConfigItem;
  run: AnimationConfigItem;
}

export class Player {
  animation: Animation<keyof PlayerAnimation>;
  mouseRay: MouseRay;

  private unsubs: Array<() => void> = [];

  constructor(
    private game: Game,
    public rust: RustPlayer,
    public model: Group,
    anim: PlayerAnimation,
  ) {
    this.mouseRay = new MouseRay(this.game.camera.cam, this.game.assets.ground);
    this.animation = new Animation(this.model, {
      idle: anim.idle,
      death: anim.death,
      run: anim.run,
    });
    this.animation.play('idle');
    this.unsubs.push(
      this.mouseRay.subscribe((inter) => {
        if (inter[0]) {
          // const nogo = this.game.nogo as RustNogo;
          // const trans = FunctionBuilder.linear2D([
          //   [0, 0],
          //   [100, 150],
          // ]);
          // const current = [
          //   parseInt(trans(this.rust.obj.position[0]) + ''),
          //   parseInt(trans(this.rust.obj.position[1]) + ''),
          // ];
          // const target = [
          //   parseInt(trans(inter[0].point.x) + ''),
          //   parseInt(trans(inter[0].point.z) + ''),
          // ];
          // PathFinding.a_star(
          //   this.game,
          //   nogo.nodes[current[0] + 150 * current[1]],
          //   nogo.nodes[target[0] + 150 * target[1]],
          //   // nogo.nodes[97 + 150 * 102],
          //   nogo,
          // );
          invoke('player_set_wanted_position', {
            wantedPosition: [inter[0].point.x, inter[0].point.z],
          }).catch((err) => console.error(err));
        }
      }),
      Keyboard.subscribe(KeyboardEventType.KEY_DOWN, async (state) => {
        await this.setMove(state);
        if (state.r || state.R) {
          window.location.reload();
        }
      }),
      Keyboard.subscribe(KeyboardEventType.KEY_UP, async (state) => {
        await this.setMove(state);
      }),
      Ticker.subscribe(async (_ct, dt) => {
        await this.update(dt / 800);
      }),
    );
  }

  private async setMove(state: KeyboardState) {
    const move: [number, number] = [0, 0];
    if (state.w) {
      move[1] = 1;
    } else if (state.s) {
      move[1] = -1;
    } else {
      move[1] = 0;
    }
    if (state.a) {
      move[0] = -1;
    } else if (state.d) {
      move[0] = 1;
    } else {
      move[0] = 0;
    }
    await invoke('player_motion', { m: move });
  }

  async update(t: number) {
    this.rust = await invoke<RustPlayer>('player_get');
    if (
      this.rust.motion[0] !== 0 ||
      this.rust.motion[1] !== 0 ||
      this.rust.wanted_position
    ) {
      if (this.animation.getActiveAnimation() !== 'run') {
        this.animation.play('run');
      }
    } else {
      if (this.animation.getActiveAnimation() !== 'idle') {
        this.animation.play('idle');
      }
    }
    this.model.rotation.set(0, -this.rust.angle + PI12, 0);
    this.model.position.set(
      this.rust.obj.position[0],
      Distance.heightTo(this.rust.obj.position, this.game.assets.ground),
      this.rust.obj.position[1],
    );
    this.animation.mixer.update(t);
  }

  destroy() {
    while (this.unsubs.length > 0) {
      const unsub = this.unsubs.pop();
      if (unsub) {
        unsub();
      }
    }
    this.mouseRay.destroy();
  }
}

export async function createPlayer(
  game: Game,
  playerSlug: string,
): Promise<Player> {
  const char = bcms.characters.find((e) => e.slug === playerSlug);
  if (!char) {
    throw Error(`Character "${playerSlug}" does not exist`);
  }
  const rust = await invoke<RustPlayer>('player_load', {
    characterSlug: 'demo',
  });
  AssetLoader.register(
    {
      name: 't_pose',
      path: char.animation.t_pose.src,
      type: 'fbx',
    },
    {
      name: 'idle',
      path: char.animation.idle.src,
      type: 'fbx',
    },
    {
      name: 'run',
      path: char.animation.run.src,
      type: 'fbx',
    },
    {
      name: 'death',
      path: char.animation.death.src,
      type: 'fbx',
    },
  );
  const playerAnim: { [key: string]: Group } = {};
  const loaderUnsub = AssetLoader.onLoaded(async (item, data) => {
    playerAnim[item.name] = data as Group;
  });
  await AssetLoader.run();
  loaderUnsub();
  playerAnim.t_pose.traverse((m) => {
    m.castShadow = true;
  });
  playerAnim.t_pose.scale.set(0.003, 0.003, 0.003);
  game.scene.add(playerAnim.t_pose);
  return new Player(game, rust, playerAnim.t_pose, {
    death: {
      model: playerAnim.death,
    },
    idle: {
      model: playerAnim.idle,
    },
    run: {
      model: playerAnim.run,
    },
  });
}
