import { PerspectiveCamera } from 'three';
import { degToRad } from 'three/src/math/MathUtils';
import { MapMaker } from './main.ts';
import { Ticker } from '@fdd/util/ticker.ts';
import { Point, Point3 } from '@fdd/types/rs';
import { useSdk } from '@fdd/sdk';
import {
    PI12,
    PI_2,
    createLinear2D,
    createStepedLinear2D,
} from '@fdd/util/math.ts';
import { Mouse, MouseEventType } from '@fdd/user-input/mouse.ts';
import { Keyboard, KeyboardEventType } from '@fdd/user-input/keyboard.ts';
import { findParent } from '@fdd/util/dom.ts';

function filterEvents(e: HTMLElement | EventTarget | null | undefined) {
    return findParent(
        e as HTMLElement,
        (el) => el.id === 'map-maker-renderer-container',
    )
        ? true
        : false;
}

export class MapMakerCamera {
    cam: PerspectiveCamera;
    position: {
        //     x       y .     z
        curr: [number, number, number];
        //       x .     y .     z
        wanted: [number, number, number];
    } = {
        curr: [0, 0, 0],
        wanted: [0, 0, 0],
    };
    alpha: {
        curr: number;
        old: number;
    } = {
        curr: -PI12,
        old: 0,
    };
    fi = degToRad(45);
    followPoint: Point3 = {
        x: 0,
        y: 0,
        z: 0,
    };

    private angleChangeFn = createLinear2D(
        [0, 0],
        [window.innerWidth / 2, PI_2],
    );
    private distanceChangeFn = createLinear2D([0, 0], [0, 0]);
    private unsubs: Array<() => void> = [];
    // ---- Camera distance ----
    //          min
    //           |  max
    //           |  |   curr
    private D = [1, 150, 5];
    private move: Point = {
        x: 0,
        y: 0,
    };

    constructor(
        private maker: MapMaker,
        public camSpeed: number,
        position?: [number, number, number],
        rotation?: number,
        distance?: number,
    ) {
        if (position) {
            this.followPoint = {
                x: position[0],
                y: position[1],
                z: position[2],
            };
        }
        if (distance) {
            this.D[2] = distance;
        }
        if (rotation) {
            this.alpha.curr = rotation;
        }
        this.cam = new PerspectiveCamera(undefined, undefined, 0.01, 1000);
        this.position.curr = [
            this.followPoint.x,
            this.followPoint.y,
            this.followPoint.y,
        ];
        this.position.wanted = [...this.position.curr];
        window.addEventListener('resize', () => {
            this.angleChangeFn = createLinear2D(
                [0, 0],
                [window.innerWidth / 2, PI12],
            );
        });
        const interval = setInterval(() => this.sendCameraData(), 1000);
        this.unsubs.push(
            () => {
                clearInterval(interval);
            },
            Mouse.subscribe(MouseEventType.MOUSE_DOWN, async (state, event) => {
                if (!filterEvents(event.target)) {
                    return;
                }
                if (state.middle) {
                    this.distanceChangeFn = createStepedLinear2D([
                        [0, this.D[0]],
                        [state.y, this.D[2]],
                        [window.innerHeight, this.D[1]],
                    ]);
                    this.angleChangeFn = createLinear2D(
                        [state.x, 0],
                        [state.x + window.innerWidth / 2, PI12],
                    );
                    this.alpha.old = this.alpha.curr;
                }
            }),
            Mouse.subscribe(MouseEventType.MOUSE_UP, (state) => {
                if (!state.middle) {
                    this.alpha.old = this.alpha.curr;
                }
            }),
            Mouse.subscribe(MouseEventType.MOUSE_MOVE, (state, event) => {
                if (!filterEvents(event.target)) {
                    return;
                }
                event.preventDefault();
                if (state.middle) {
                    const alphaDelta = this.angleChangeFn.call(state.x);
                    this.alpha.curr = this.alpha.old + alphaDelta;
                    this.D[2] = this.distanceChangeFn.call(state.y);
                }
            }),
            Keyboard.subscribe(KeyboardEventType.ALL, (state, _) => {
                if (!filterEvents(Mouse.state.elUnderCursor)) {
                    this.move.y = 0;
                    this.move.x = 0;
                    return;
                }
                if (state.w) {
                    this.move.y = this.camSpeed;
                }
                if (state.s) {
                    this.move.y = -this.camSpeed;
                }
                if (!state.w && !state.s) {
                    this.move.y = 0;
                }
                if (state.a) {
                    this.move.x = this.camSpeed;
                }
                if (state.d) {
                    this.move.x = -this.camSpeed;
                }
                if (!state.a && !state.d) {
                    this.move.x = 0;
                }
            }),
            Ticker.subscribe(async () => {
                this.update();
            }),
        );
        this.calcPosition();
    }

    private sendCameraData() {
        const sdk = useSdk();
        sdk.gameMap
            .landscapeSetCamera(
                this.maker.landscape.gameMap.id,
                {
                    x: this.followPoint.x,
                    y: this.followPoint.y,
                    z: this.followPoint.z,
                },
                this.alpha.curr,
                this.D[2],
                this.camSpeed,
            )
            .catch((err) => {
                console.error(err);
            });
    }

    private calcPosition() {
        if (
            this.position.wanted[0] !== this.followPoint.x ||
            this.position.wanted[1] !== this.followPoint.y ||
            this.position.wanted[2] !== this.followPoint.z
        ) {
            this.position.wanted = [
                this.followPoint.x,
                this.followPoint.y,
                this.followPoint.z,
            ];
        }
        if (
            this.position.wanted[0] !== this.position.curr[0] ||
            this.position.wanted[1] !== this.position.curr[1] ||
            this.position.wanted[2] !== this.position.curr[2] ||
            this.alpha.curr !== this.alpha.old
        ) {
            const dx = (this.position.wanted[0] - this.position.curr[0]) / 10;
            const dy = (this.position.wanted[1] - this.position.curr[1]) / 10;
            const dz = (this.position.wanted[2] - this.position.curr[2]) / 10;
            this.position.curr[0] += dx;
            this.position.curr[1] += dy;
            this.position.curr[2] += dz;
            const d = this.D[2] * Math.cos(this.fi);
            const y = this.D[2] * Math.sin(this.fi);
            const x = d * Math.cos(this.alpha.curr);
            const z = d * Math.sin(this.alpha.curr);
            if (this.alpha.curr) {
                this.cam.position.x = this.position.curr[0] - x;
            }
            this.cam.position.y = this.position.curr[1] + y;
            this.cam.position.z = this.position.curr[2] - z;
        }
    }

    update() {
        const xw1 = this.move.x * Math.cos(this.alpha.curr - PI12);
        const zw1 = this.move.x * Math.sin(this.alpha.curr - PI12);
        const xw2 = this.move.y * Math.cos(this.alpha.curr);
        const zw2 = this.move.y * Math.sin(this.alpha.curr);
        // this.followPoint.x += this.move.x * Math.cos(this.alpha.curr);
        // this.followPoint.y += this.move.y * Math.sin(this.alpha.curr);
        this.followPoint.x += xw1 + xw2;
        this.followPoint.z += zw1 + zw2;
        this.calcPosition();
        this.cam.lookAt(...this.position.curr);
    }

    destroy() {
        while (this.unsubs.length > 0) {
            const unsub = this.unsubs.pop();
            if (unsub) {
                unsub();
            }
        }
    }
}
