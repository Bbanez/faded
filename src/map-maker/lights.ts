import { AmbientLight, DirectionalLight } from 'three';
import { callAndClearUnsubscribeFns, UnsubscribeFns } from '../util/sub.ts';
import { MapMaker } from './main.ts';

export class MapMakerLights {
    sun: DirectionalLight;
    ambientLight: AmbientLight;

    private unsubs: UnsubscribeFns = [];

    constructor(private maker: MapMaker) {
        // this.sun = new DirectionalLight(0x2351A3, 10);
        this.sun = new DirectionalLight(0xffffff, 4);
        this.sun.position.set(
            maker.landscape.data.size.width + 10,
            50,
            maker.landscape.data.size.depth + 10,
        );
        this.sun.castShadow = true;
        const sunRes = 10000;
        const sunGroundSize = 100;
        this.sun.shadow.mapSize.width = sunRes;
        this.sun.shadow.mapSize.height = sunRes;
        this.sun.shadow.camera.left = sunGroundSize;
        this.sun.shadow.camera.right = -sunGroundSize;
        this.sun.shadow.camera.top = sunGroundSize / 2;
        this.sun.shadow.camera.bottom = -sunGroundSize / 2;
        this.sun.target.position.set(
            maker.landscape.data.size.width / 2,
            0,
            maker.landscape.data.size.depth / 2,
        );
        this.maker.scene.add(this.sun);
        this.maker.scene.add(this.sun.target);

        this.ambientLight = new AmbientLight(0xffffff, 0.1);
        this.maker.scene.add(this.ambientLight);
    }

    destroy() {
        callAndClearUnsubscribeFns(this.unsubs);
    }
}
