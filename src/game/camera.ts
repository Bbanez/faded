import { PerspectiveCamera } from 'three';
import { degToRad } from 'three/src/math/MathUtils';
import { GameManager } from './main';
import { Point3 } from '@fdd/types/rs';
import {
    PI12,
    PI_2,
    createLinear2D,
    createStepedLinear2D,
} from '@fdd/util/math';
import { Mouse, MouseEventType } from '@fdd/user-input/mouse';
import { Ticker } from '@fdd/util/ticker';

export class Camera {
    cam: PerspectiveCamera;
    followPoint: Point3 | null = null;
    position: {
        curr: Point3;
        wanted: Point3;
    } = {
        curr: { x: 0, y: 0, z: 0 },
        wanted: { x: 0, y: 0, z: 0 },
    };
    alpha: {
        curr: number;
        old: number;
    } = {
        curr: -PI12,
        old: 0,
    };
    fi = degToRad(45);

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
    private D = [1, 1500, 5];

    constructor(
        private gameManager: GameManager,
        startPosition?: Point3,
    ) {
        this.cam = new PerspectiveCamera(undefined, undefined, 0.01, 1000);
        if (startPosition) {
            this.position.curr = {
                x: startPosition.x,
                y: startPosition.y,
                z: startPosition.z,
            };
            this.position.wanted = { ...this.position.curr };
        }
        window.addEventListener('resize', () => {
            this.angleChangeFn = createLinear2D(
                [0, 0],
                [window.innerWidth / 2, PI12],
            );
        });
        this.unsubs.push(
            Mouse.subscribe(MouseEventType.MOUSE_DOWN, async (state) => {
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
                event.preventDefault();
                if (state.middle) {
                    const alphaDelta = this.angleChangeFn.call(state.x);
                    this.alpha.curr = this.alpha.old + alphaDelta;
                    this.D[2] = this.distanceChangeFn.call(state.y);
                }
            }),
            Ticker.subscribe(async () => {
                this.update();
            }),
        );
        this.calcPosition();
    }

    private calcPosition() {
        if (this.followPoint) {
            if (
                this.position.wanted.x !== this.followPoint.x ||
                this.position.wanted.y !== this.followPoint.y ||
                this.position.wanted.z !== this.followPoint.z
            ) {
                this.position.wanted = { ...this.followPoint };
            }
        }
        if (
            this.position.wanted.x !== this.position.curr.x ||
            this.position.wanted.y !== this.position.curr.y ||
            this.position.wanted.z !== this.position.curr.z ||
            this.alpha.curr !== this.alpha.old
        ) {
            const dx = (this.position.wanted.x - this.position.curr.x) / 10;
            const dy = (this.position.wanted.y - this.position.curr.y) / 10;
            const dz = (this.position.wanted.z - this.position.curr.z) / 10;
            this.position.curr.x += dx;
            this.position.curr.y += dy;
            this.position.curr.z += dz;
            const d = this.D[2] * Math.cos(this.fi);
            const y = this.D[2] * Math.sin(this.fi);
            const x = d * Math.cos(this.alpha.curr);
            const z = d * Math.sin(this.alpha.curr);
            if (this.alpha.curr) {
                this.cam.position.x = this.position.curr.x - x;
            }
            this.cam.position.y = this.position.curr.y + y;
            this.cam.position.z = this.position.curr.z - z;
        }
    }

    setWantedPosition(position: Point3) {
        this.position.wanted = { ...position };
    }

    setPosition(position: Point3) {
        this.followPoint = null;
        this.position.curr = { ...position };
        this.position.wanted = { ...position };
    }

    follow(point: Point3 | null) {
        this.followPoint = point;
    }

    update() {
        this.calcPosition();
        this.cam.lookAt(
            this.position.curr.x,
            this.position.curr.y,
            this.position.curr.z,
        );
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
