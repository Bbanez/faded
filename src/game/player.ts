import { AnimationConfigItem } from '@fdd/_game/animation';
import { GamePlayer, Point } from '@fdd/types/rs';
import {
    Group,
    Mesh,
    MeshBasicMaterial,
    MeshStandardMaterial,
    PlaneGeometry,
} from 'three';
import { GameManager } from './main';
import { Sdk } from '@fdd/sdk';
import { Animation } from './animation';
import { MouseRay } from '@fdd/util/mouse-ray';
import { UnsubscribeFns, callAndClearUnsubscribeFns } from '@fdd/util/sub';
import { Ticker } from '@fdd/util/ticker';
import { Distance } from '@fdd/util/distance';
import { PI12 } from '@fdd/util/math';

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
    pathContainer: Group = new Group();

    private unsubs: UnsubscribeFns = [];

    constructor(
        private sdk: Sdk,
        private gameManager: GameManager,
        public gamePlayer: GamePlayer,
        public assets: PlayerAssets,
        public playerIdx: number,
    ) {
        this.gameManager.scene.add(this.pathContainer);
        this.mouseRay = new MouseRay(
            this.gameManager.camera.cam,
            this.gameManager.landscape.groundMesh,
        );
        this.assets.t.scale.set(0.01, 0.01, 0.01);
        this.assets.t.castShadow = true;
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
                    const solve = async () => {
                        const end: Point = {
                            x: inter[0].point.x,
                            y: inter[0].point.z,
                        };
                        this.gamePlayer = await this.sdk.game.playerMove(
                            this.gameManager.gameMap.id,
                            this.playerIdx,
                            end,
                        );
                        // const start = this.gamePlayer.bb.position;
                        // const path = await sdk.gameMap.pathFind(
                        //     this.gameManager.gameMap.id,
                        //     start,
                        //     end,
                        // );
                        // if (!path) {
                        //     throw Error('No path');
                        // }
                        // this.pathContainer.clear();
                        // for (let i = 0; i < path.length; i++) {
                        //     const item = path[i];
                        //     const geo = new Mesh(
                        //         new PlaneGeometry(1, 1),
                        //         new MeshStandardMaterial({
                        //             color: 0x00ff00,
                        //         }),
                        //     );
                        //     geo.position.x = item.x + 0.5;
                        //     geo.position.z = item.y + 0.5;
                        //     geo.position.y = 1.2;
                        //     geo.rotation.x -= PI12;
                        //     this.pathContainer.add(geo);
                        // }
                    };
                    solve().catch((err) => console.error(err));
                }
            }),
            Ticker.subscribe(async (_cTime, dt) => {
                this.update(dt / 800);
            }),
        );
    }

    update(timeStep: number) {
        this.assets.t.rotation.set(0, -this.gamePlayer.angle + PI12, 0);
        this.assets.t.position.set(
            this.gamePlayer.bb.position.x,
            Distance.heightTo(
                this.gamePlayer.bb.position,
                this.gameManager.landscape.groundMesh,
            ),
            this.gamePlayer.bb.position.y,
        );
        if (this.boundingBoxG) {
            this.boundingBoxG.position.set(
                this.gamePlayer.bb.position.x,
                this.assets.t.position.y + 0.2,
                this.gamePlayer.bb.position.y,
            );
        }
        this.animation.mixer.update(timeStep);
    }

    showBb() {
        this.boundingBoxG = new Mesh(
            new PlaneGeometry(
                this.gamePlayer.bb.size.width,
                this.gamePlayer.bb.size.height,
            ),
            new MeshBasicMaterial({
                color: '#ff00ff',
            }),
        );
        this.boundingBoxG.rotateX(-PI12);
        this.boundingBoxG.position.set(
            this.gamePlayer.bb.position.x,
            this.assets.t.position.y + 1.1,
            this.gamePlayer.bb.position.y,
        );
        this.gameManager.scene.add(this.boundingBoxG);
    }

    disableBb() {
        if (this.boundingBoxG) {
            this.gameManager.scene.remove(this.boundingBoxG);
            this.boundingBoxG = null;
        }
    }

    destroy() {
        callAndClearUnsubscribeFns(this.unsubs);
        this.mouseRay.destroy().catch((err) => console.error(err));
    }
}
