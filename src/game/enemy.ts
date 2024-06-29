import type { Enemy as EnemyRust } from '../types/rs';
import { Animation, AnimationConfigItem } from './animation.ts';
import { Group, Mesh, MeshBasicMaterial, PlaneGeometry } from 'three';
import { Sdk, useSdk } from '../sdk/main.ts';
import { Game } from './main.ts';
import { Ticker } from './ticker.ts';
import { PI12 } from './consts.ts';
import { Distance } from './distance.ts';
import { callAndClearUnsubscribeFns } from '../util/sub.ts';
import { AssetLoader } from './asset-loader.ts';

export interface EnemyAnimation {
    idle: AnimationConfigItem;
    death: AnimationConfigItem;
    run: AnimationConfigItem;
}

export interface EnemyAssets {
    t: Group;
    idle: Group;
    run: Group;
    death: Group;
}

class EnemyAssetLoader {
    static async load(name: string): Promise<EnemyAssets> {
        const assets: EnemyAssets = {
            death: null as never,
            run: null as never,
            idle: null as never,
            t: null as never,
        };
        AssetLoader.register(
            {
                name: 'enemy_' + name + '_t',
                path: `/assets/enemies/${name}/t.fbx`,
                type: 'fbx',
            },
            {
                name: 'enemy_' + name + '_idle',
                path: `/assets/enemies/${name}/idle.fbx`,
                type: 'fbx',
            },
            {
                name: 'enemy_' + name + '_run',
                path: `/assets/enemies/${name}/run.fbx`,
                type: 'fbx',
            },
            {
                name: 'enemy_' + name + '_death',
                path: `/assets/enemies/${name}/death.fbx`,
                type: 'fbx',
            },
        );
        const loaderUnsub = AssetLoader.onLoaded(async (item, data) => {
            if (item.name.startsWith('enemy_' + name)) {
                assets[item.name.split('_')[2] as keyof EnemyAssets] =
                    data as Group;
            }
        });
        await AssetLoader.run();
        loaderUnsub();
        assets.t.traverse((m) => {
            m.castShadow = true;
        });
        assets.t.scale.set(0.003, 0.003, 0.003);
        return assets;
    }
}

export class Enemy {
    animation: Animation<keyof EnemyAnimation>;
    boundingBoxG: Mesh | null = null;

    private unsubs: Array<() => void> = [];

    constructor(
        public sdk: Sdk,
        public game: Game,
        public data: EnemyRust,
        public assets: EnemyAssets,
    ) {
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
            Ticker.subscribe(async (_cTime, dt) => {
                await this.update(dt / 800);
            }),
        );
    }

    async update(timeStep: number) {
        const enemy = this.game.manager.enemies.find(
            (e) => e.id === this.data.id,
        );
        if (enemy) {
            this.data = enemy;
            if (this.data.wanted_position) {
                if (this.animation.getActiveAnimation() !== 'run') {
                    this.animation.play('run');
                }
            } else {
                if (this.animation.getActiveAnimation() !== 'idle') {
                    this.animation.play('idle');
                }
            }
            this.assets.t.rotation.set(0, -this.data.angle + PI12, 0);
            this.assets.t.position.set(
                this.data.bounding_box.position.x,
                Distance.heightTo(
                    this.data.bounding_box.position,
                    this.game.landscape.group,
                ),
                this.data.bounding_box.position.y,
            );
            if (this.boundingBoxG) {
                this.boundingBoxG.position.set(
                    this.data.bounding_box.position.x,
                    this.assets.t.position.y + 0.2,
                    this.data.bounding_box.position.y,
                );
            }
            this.animation.mixer.update(timeStep);
        }
    }

    showBb() {
        this.boundingBoxG = new Mesh(
            new PlaneGeometry(
                this.data.bounding_box.size.width,
                this.data.bounding_box.size.height,
            ),
            new MeshBasicMaterial({
                color: '#ff00ff',
            }),
        );
        this.boundingBoxG.rotateX(-PI12);
        this.boundingBoxG.position.set(
            this.data.bounding_box.position.x,
            this.assets.t.position.y + 1.1,
            this.data.bounding_box.position.y,
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
    }
}

export async function createEnemy(game: Game, data: EnemyRust) {
    const assets = await EnemyAssetLoader.load(data.data_id);
    game.scene.add(assets.t);
    console.log(data)
    // console.log(assets.t)
    return new Enemy(useSdk(), game, data, assets);
}
