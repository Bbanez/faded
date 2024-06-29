import { v4 as uuidv4 } from 'uuid';
import {
    Color,
    CubeTexture,
    Group,
    Mesh,
    MeshBasicMaterial,
    PlaneGeometry,
    Scene,
    Texture,
} from 'three';
import { Renderer } from './renderer';
import { Mouse } from './mouse';
import { Keyboard } from './keyboard';
import { Ticker } from './ticker';
import { PI12 } from './consts';
import { Camera } from './camera';
import { Player, createPlayer } from './player';
import { Character, Manager } from '../types/rs';
import { api_call } from '../rust/api-call.ts';
import { useSdk } from '../sdk/main.ts';
import { Lights } from './lights.ts';
import { FPS } from './fps.ts';
import { GrassSystem } from './grass-system.ts';
import { createLandscape, Landscape } from './landscape.ts';
import { createEnemy, Enemy } from './enemy.ts';

export interface GameConfig {
    el: HTMLElement;
    frameTicker: boolean;
    mapId: string;
    characterId: string;
    manager: Manager;
}

export class GameAssets {
    ground: Group = null as never;
    skybox: CubeTexture = null as never;
    grad: Texture = null as never;
    cursorMove: Texture = null as never;
    grass: Group = null as never;
}

export class Game {
    id = uuidv4();
    scene: Scene;
    renderer: Renderer;
    camera: Camera;
    fps: FPS;
    player: Player = null as never;
    enemies: Enemy[] = [];
    fpsEl = document.createElement('div');
    lights: Lights = null as never;
    grassSystem: GrassSystem = null as never;

    private unsubs: Array<() => void> = [];

    constructor(
        public el: HTMLElement,
        private frameTicker: boolean,
        public manager: Manager,
        public landscape: Landscape,
        public character: Character,
    ) {
        this.fps = new FPS();
        this.scene = new Scene();
        this.scene.background = new Color(0, 0, 0);
        this.camera = new Camera(this, [
            this.manager.player.bounding_box.position.x - 0.00001,
            this.manager.player.bounding_box.position.y - 0.00001,
        ]);
        this.renderer = new Renderer(this.el, this.scene, this.camera.cam);
        Mouse.init();
        Keyboard.init();

        Ticker.reset();
        const rustOnTick = api_call<void, void>('on_tick');
        this.unsubs.push(
            Ticker.subscribe(async () => {
                await rustOnTick();
            }),
        );
        if (this.frameTicker) {
            this.frameTick().catch((err) => console.error(err));
        }
    }

    private async frameTick() {
        await Ticker.tick();
        if (this.frameTicker) {
            requestAnimationFrame(async () => {
                await this.frameTick();
            });
        }
    }

    async initialize() {
        await this.renderer.loadPostProcessing();
        this.scene.add(this.landscape.group);
        this.scene.background = this.landscape.skybox;

        const water = new Mesh(
            new PlaneGeometry(
                this.landscape.map.width,
                this.landscape.map.height,
            ),
            new MeshBasicMaterial({
                color: 0x004477,
                transparent: true,
                opacity: 0.95,
            }),
        );
        water.rotation.x = -PI12;
        water.position.set(
            this.landscape.map.width / 2,
            3,
            this.landscape.map.height / 2,
        );
        this.scene.add(water);
        this.renderer.onResize();

        this.player = await createPlayer(this, this.manager, this.character);
        for (let i = 0; i < this.manager.enemies.length; i++) {
            const enemy = this.manager.enemies[i];
            this.enemies.push(await createEnemy(this, enemy));
        }
        await this.player.update(0);
        this.camera.follow(this.player);

        this.lights = new Lights(this);
        this.grassSystem = new GrassSystem(this);
    }

    destroy() {
        while (this.unsubs.length > 0) {
            const unsub = this.unsubs.pop();
            if (unsub) {
                unsub();
            }
        }
        this.lights.destroy();
        this.scene.clear();
        this.renderer.destroy();
        this.el.innerHTML = '';
        this.player?.destroy();
        this.camera.destroy();
        Mouse.destroy();
        Keyboard.destroy();
        Ticker.clear();
        this.frameTicker = false;
        this.fps.destroy();
        this.grassSystem.destroy();
        this.landscape.destroy();
    }
}

export async function createGame(config: GameConfig): Promise<Game> {
    const sdk = useSdk();
    await sdk.settings.get({
        width: window.innerWidth,
        height: window.innerHeight,
    });
    const character = (await sdk.data.characters()).find(
        (e) => e.id === config.characterId,
    );
    if (!character) {
        throw Error(`Character "${config.characterId}" does not exist`);
    }
    const landscape = await createLandscape(config.mapId);
    return new Game(
        config.el,
        config.frameTicker,
        config.manager,
        landscape,
        character,
    );
}
