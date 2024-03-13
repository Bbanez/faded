import { v4 as uuidv4 } from 'uuid';
import cursorMoveVert from './shaders/cursor-move.vert';
import cursorMoveFrag from './shaders/cursor-move.frag';
import { Group, Mesh, PlaneGeometry, ShaderMaterial } from 'three';
import { Animation, AnimationConfigItem } from './animation';
import { Game } from './main';
import { bcms } from './bcms';
import { AssetLoader } from './asset-loader';
import { MouseRay } from './mouse-ray';
import { Keyboard, KeyboardEventType, KeyboardState } from './keyboard';
import { Distance } from './distance';
import { Ticker } from './ticker';
import { PI12 } from './consts';
import { game } from '../../wailsjs/go/models';
import {
    PlayerGet,
    PlayerLoad,
    PlayerSetMotion,
} from '../../wailsjs/go/game/Api';

export interface PlayerAnimation {
    idle: AnimationConfigItem;
    death: AnimationConfigItem;
    run: AnimationConfigItem;
}

export class Player {
    animation: Animation<keyof PlayerAnimation>;
    mouseRay: MouseRay;

    private cursorObjects: Array<{
        id: string;
        mesh: Mesh;
        shader: ShaderMaterial;
        expAt: number;
    }> = [];
    private unsubs: Array<() => void> = [];

    constructor(
        private game: Game,
        public go: game.Player,
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
                    const shaderMaterial = new ShaderMaterial({
                        uniforms: {
                            uTexture: {
                                value: this.game.assets.cursorMove,
                            },
                            uMillis: {
                                value: 0.0,
                            },
                        },
                        vertexShader: cursorMoveVert,
                        fragmentShader: cursorMoveFrag,
                        transparent: true,
                    });
                    const plane = new Mesh(new PlaneGeometry(0.2, 0.2), shaderMaterial);
                    plane.position.set(inter[0].point.x, inter[0].point.y + 0.2, inter[0].point.z);
                    plane.rotation.y = -this.game.camera.alpha.curr - PI12;
                    this.cursorObjects.push({
                        id: uuidv4(),
                        mesh: plane,
                        shader: shaderMaterial,
                        expAt: Date.now() + 1000,
                    });
                    this.game.scene.add(plane);
                    // TODO
                    // invoke('player_set_wanted_position', {
                    //   wantedPosition: [inter[0].point.x, inter[0].point.z],
                    // }).catch((err) => console.error(err));
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
            Ticker.subscribe(async (cTime, dt) => {
                await this.update(dt / 800);
                const removeCursorObjects: string[] = [];
                for (let i = 0; i < this.cursorObjects.length; i++) {
                    if (this.cursorObjects[i].expAt < Date.now()) {
                        removeCursorObjects.push(this.cursorObjects[i].id);
                        this.game.scene.remove(this.cursorObjects[i].mesh);
                    }
                }
                this.cursorObjects = this.cursorObjects.filter(
                    (e) => !removeCursorObjects.includes(e.id),
                );
                for (let i = 0; i < this.cursorObjects.length; i++) {
                    this.cursorObjects[i].shader.uniforms.uMillis.value += dt;
                    this.cursorObjects[i].mesh.position.y += Math.sin(cTime / 100) / 100;
                }
            }),
        );
    }

    private async setMove(state: KeyboardState) {
        const move: game.Point = {
            x: 0,
            y: 0,
        };
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
        await PlayerSetMotion(move);
    }

    async update(t: number) {
        this.go = await PlayerGet();
        if (this.go.motion.x !== 0 || this.go.motion.y !== 0 || this.go.wantedPosition) {
            if (this.animation.getActiveAnimation() !== 'run') {
                this.animation.play('run');
            }
        } else {
            if (this.animation.getActiveAnimation() !== 'idle') {
                this.animation.play('idle');
            }
        }
        this.model.rotation.set(0, -this.go.angle + PI12, 0);
        this.model.position.set(
            this.go.boundingBox.position.x,
            Distance.heightTo(
                [this.go.boundingBox.position.x, this.go.boundingBox.position.y],
                this.game.assets.ground,
            ),
            this.go.boundingBox.position.y,
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
    characterSlug: string,
    mapSlug: string,
): Promise<Player> {
    const char = bcms.characters.find((e) => e.slug === characterSlug);
    if (!char) {
        throw Error(`Character "${characterSlug}" does not exist`);
    }
    const go = await PlayerLoad(characterSlug, mapSlug);
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
    return new Player(game, go, playerAnim.t_pose, {
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
