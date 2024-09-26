import { AmbientLight, DirectionalLight } from 'three';
import { callAndClearUnsubscribeFns, UnsubscribeFns } from '@fdd/util/sub.ts';
import { GameManager } from './main';
import { Ticker } from '@fdd/util/ticker.ts';

export class Lights {
    sun: DirectionalLight;
    ambientLight: AmbientLight;
    // playerLight: PointLight;

    private unsubs: UnsubscribeFns = [];

    constructor(private gameManager: GameManager) {
        // this.sun = new DirectionalLight(0x2351A3, 10);
        this.sun = new DirectionalLight(0x66aaff, 2);
        this.sun.position.set(0, 50, 0);
        this.sun.castShadow = true;
        const sunRes = 2000;
        const sunGroundSize = 8;
        this.sun.shadow.mapSize.width = sunRes;
        this.sun.shadow.mapSize.height = sunRes;
        this.sun.shadow.camera.left = sunGroundSize;
        this.sun.shadow.camera.right = -sunGroundSize;
        this.sun.shadow.camera.top = sunGroundSize / 2;
        this.sun.shadow.camera.bottom = -sunGroundSize / 2;
        this.sun.target.position.set(10, 0, 10);
        this.gameManager.scene.add(this.sun);
        this.gameManager.scene.add(this.sun.target);

        this.ambientLight = new AmbientLight(0xffffff, 0.1);
        this.gameManager.scene.add(this.ambientLight);

        // this.playerLight = new PointLight(0xaabbff, 1);
        // this.playerLight.position.set(
        //     this.gameManager.player.manager.player.bounding_box.position.x,
        //     this.gameManager.player.assets.t.position.y + 10,
        //     this.gameManager.manager.player.bounding_box.position.y,
        // );
        // this.game.scene.add(this.playerLight);
        this.unsubs.push(
            Ticker.subscribe(async () => {
                // if (this.gameManager.player) {
                //     this.sun.target.position.set(
                //         this.game.player.assets.t.position.x,
                //         this.game.player.assets.t.position.y,
                //         this.game.player.assets.t.position.z,
                //     );
                //     this.playerLight.position.set(
                //         this.game.player.assets.t.position.x,
                //         this.game.player.assets.t.position.y + 1,
                //         this.game.player.assets.t.position.z,
                //     );
                // }
            }),
        );
    }

    destroy() {
        callAndClearUnsubscribeFns(this.unsubs);
    }
}
