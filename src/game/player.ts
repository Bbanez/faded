import { Group, Mesh, MeshBasicMaterial, PlaneGeometry } from 'three';
import { Animation, AnimationConfigItem } from './animation';
import { Game } from './main';
import { AssetLoader } from './asset-loader';
import { MouseRay } from './mouse-ray';
import { Keyboard, KeyboardEventType, KeyboardState } from './keyboard';
import { Distance } from './distance';
import { PI12 } from './consts';
import type { Character, Manager, Point } from '../types/rs';
import { Sdk, useSdk } from '../sdk/main.ts';
import { Ticker } from './ticker.ts';
import { callAndClearUnsubscribeFns } from '../util/sub.ts';

export interface PlayerAnimation {
    idle: AnimationConfigItem;
    death: AnimationConfigItem;
    run: AnimationConfigItem;
}

export interface PlayerAssets {
    t: Group;
    idle: Group;
    run: Group;
    death: Group;
}

export class Player {
    animation: Animation<keyof PlayerAnimation>;
    mouseRay: MouseRay;
    boundingBoxG: Mesh | null = null;

    private unsubs: Array<() => void> = [];

    constructor(
        private sdk: Sdk,
        private game: Game,
        public manager: Manager,
        public character: Character,
        public assets: PlayerAssets,
    ) {
        this.mouseRay = new MouseRay(
            this.game.camera.cam,
            this.game.landscape.group,
        );
        this.animation = new Animation(this.assets.t, {
            idle: {
                model: this.assets.idle,
            },
            death: {
                model: this.assets.death,
            },
            run: {
                model: this.assets.run,
            },
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
                    this.sdk.player
                        .set_wanted_position({
                            x: inter[0].point.x,
                            y: inter[0].point.z,
                        })
                        .then((player) => {
                            this.manager.player = player;
                        })
                        .catch((err) => console.error(err));
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
            Ticker.subscribe(async (_cTime, dt) => {
                await this.update(dt / 800);
            }),
        );
    }

    private async setMove(state: KeyboardState) {
        const move: Point = { x: 0, y: 0 };
        if (state.w) {
            move.y = 1;
        } else if (state.s) {
            move.y = -1;
        } else {
            move.y = 0;
        }
        if (state.a) {
            move.x = -1;
        } else if (state.d) {
            move.x = 1;
        } else {
            move.x = 0;
        }
        await this.sdk.player.set_motion(move);
    }

    async update(timeStep: number) {
        this.manager.player = await this.sdk.player.get();
        if (
            this.manager.player.motion.x !== 0 ||
            this.manager.player.motion.y !== 0 ||
            this.manager.player.wanted_position
        ) {
            if (this.animation.getActiveAnimation() !== 'run') {
                this.animation.play('run');
            }
        } else {
            if (this.animation.getActiveAnimation() !== 'idle') {
                this.animation.play('idle');
            }
        }
        this.assets.t.rotation.set(0, -this.manager.player.angle + PI12, 0);
        this.assets.t.position.set(
            this.manager.player.bounding_box.position.x,
            Distance.heightTo(
                this.manager.player.bounding_box.position,
                this.game.landscape.group,
            ),
            this.manager.player.bounding_box.position.y,
        );
        if (this.boundingBoxG) {
            this.boundingBoxG.position.set(
                this.manager.player.bounding_box.position.x,
                this.assets.t.position.y + 0.2,
                this.manager.player.bounding_box.position.y,
            );
        }
        this.animation.mixer.update(timeStep);
    }

    showBb() {
        this.boundingBoxG = new Mesh(
            new PlaneGeometry(
                this.manager.player.bounding_box.size.width,
                this.manager.player.bounding_box.size.height,
            ),
            new MeshBasicMaterial({
                color: '#ff00ff',
            }),
        );
        this.boundingBoxG.rotateX(-PI12);
        this.boundingBoxG.position.set(
            this.manager.player.bounding_box.position.x,
            this.assets.t.position.y + 1.1,
            this.manager.player.bounding_box.position.y,
        );
        this.game.scene.add(this.boundingBoxG);
    }

    disableBb() {
        if (this.boundingBoxG) {
            this.game.scene.remove(this.boundingBoxG);
            this.boundingBoxG = null;
        }
    }

    destroy() {
        callAndClearUnsubscribeFns(this.unsubs);
        this.mouseRay.destroy().catch((err) => console.error(err));
    }
}

export async function createPlayer(
    game: Game,
    manager: Manager,
    character: Character,
): Promise<Player> {
    const playerAssets: PlayerAssets = {
        death: null as never,
        run: null as never,
        idle: null as never,
        t: null as never,
    };
    AssetLoader.register(
        {
            name: character.id + '_t',
            path: `/assets/characters/${character.id}/t.fbx`,
            type: 'fbx',
        },
        {
            name: character.id + '_idle',
            path: `/assets/characters/${character.id}/idle.fbx`,
            type: 'fbx',
        },
        {
            name: character.id + '_run',
            path: `/assets/characters/${character.id}/run.fbx`,
            type: 'fbx',
        },
        {
            name: character.id + '_death',
            path: `/assets/characters/${character.id}/death.fbx`,
            type: 'fbx',
        },
    );
    const loaderUnsub = AssetLoader.onLoaded(async (item, data) => {
        if (item.name.startsWith(character.id)) {
            playerAssets[item.name.split('_')[1] as keyof PlayerAssets] =
                data as Group;
        }
    });
    await AssetLoader.run();
    loaderUnsub();
    playerAssets.t.traverse((m) => {
        m.castShadow = true;
    });
    playerAssets.t.scale.set(0.003, 0.003, 0.003);
    game.scene.add(playerAssets.t);
    return new Player(useSdk(), game, manager, character, playerAssets);
    // return new Player(useSdk(), game, player_data, playerAnim.t_pose, {
    //     death: {
    //         model: playerAnim.death,
    //     },
    //     idle: {
    //         model: playerAnim.idle,
    //     },
    //     run: {
    //         model: playerAnim.run,
    //     },
    // });
}
