import postProcessingVert from '@fdd/shaders/post-processing.vert';
import postProcessingFrag from '@fdd/shaders/post-processing.frag';

import {
    PCFSoftShadowMap,
    PerspectiveCamera,
    Scene,
    Texture,
    Vector2,
    WebGLRenderer,
} from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass';
import { useSdk } from '@fdd/sdk';
import { ShaderPassManager } from '@fdd/shaders/manager.ts';
import { Ticker } from '@fdd/util/ticker.ts';
import { Mouse, MouseEventType } from '@fdd/user-input/mouse.ts';
import { GameManager } from './main';
import { Settings } from '@fdd/types/rs';

export class Renderer {
    r = new WebGLRenderer();
    composer: EffectComposer;
    postProcessing = new ShaderPassManager<{
        tDiffuse: Texture | null;
        uScreen: Vector2;
        uTime: number;
        uMouse: Vector2;
    }>(postProcessingVert, postProcessingFrag, {
        tDiffuse: null,
        uMouse: new Vector2(0, 0),
        uTime: 0,
        uScreen: new Vector2(window.innerWidth, window.innerHeight),
    });
    // postProcessingShader = new ShaderPass({
    //     uniforms: {
    //         tDiffuse: null,
    //         tGrad: { value: null as any },
    //         uMillis: { value: 0.0 },
    //         uMouse: { value: [0.0, 0.0] },
    //         uScreen: { value: [window.innerWidth, window.innerHeight] },
    //     },
    //     fragmentShader: postProcessingFrag,
    //     vertexShader: postProcessingVert,
    // });

    private timeOffset = Date.now();
    private unsubs: Array<() => void> = [];
    private resizeDebounce: any = undefined;

    constructor(
        private gameManager: GameManager,
        el: HTMLElement,
        public scene: Scene,
        private camera: PerspectiveCamera,
    ) {
        const sdk = useSdk();
        const settings = sdk.settings.store.value;
        this.r = new WebGLRenderer();
        this.r.shadowMap.enabled = true;
        this.r.shadowMap.type = PCFSoftShadowMap;
        this.r.setPixelRatio(window.devicePixelRatio);
        this.composer = new EffectComposer(this.r);
        if (settings) {
            this.r.setSize(
                settings.resolution.width,
                settings.resolution.height,
            );
        } else {
            this.r.setSize(window.innerWidth, window.innerHeight);
            // this.r.setSize(200, 200);
            const resize = () => {
                this.onResize();
            };
            window.addEventListener('resize', resize);
            this.unsubs.push(() => {
                window.removeEventListener('resize', resize);
            });
        }
        this.r.domElement.setAttribute('style', 'width: 100%; height: 100%;');
        el.appendChild(this.r.domElement);
        this.unsubs.push(
            Ticker.subscribe(async () => {
                this.postProcessing.setUniform(
                    'uTime',
                    Date.now() - this.timeOffset,
                );
                this.render();
            }),
            Mouse.subscribe(MouseEventType.MOUSE_MOVE, (data) => {
                this.postProcessing.setUniform(
                    'uMouse',
                    new Vector2(data.x, data.y),
                );
            }),
        );
    }

    loadPostProcessing() {
        this.composer.addPass(new RenderPass(this.scene, this.camera));
        this.composer.addPass(this.postProcessing.shader);
        this.composer.addPass(new OutputPass());
    }

    onResize() {
        clearTimeout(this.resizeDebounce);
        this.resizeDebounce = setTimeout(() => {
            const settings: Settings = {
                created_at: BigInt(0),
                updated_at: BigInt(0),
                id: '',
                resolution: {
                    width: window.innerWidth,
                    height: window.innerHeight,
                },
            };
            // const settings = this.gameManager.sdk.settings.store.value;
            // if (!settings) {
            //     return;
            // }
            if (this.camera) {
                this.camera.aspect =
                    settings.resolution.width / settings.resolution.height;
                this.camera.updateProjectionMatrix();
            }
            this.composer.setSize(
                settings.resolution.width,
                settings.resolution.height,
            );
            this.r.domElement.setAttribute(
                'style',
                'width: 100%; height: 100%;',
            );
            this.postProcessing.setUniform(
                'uScreen',
                new Vector2(
                    settings.resolution.width,
                    settings.resolution.height,
                ),
            );
            this.composer.render();
        }, 200);
    }

    destroy() {
        while (this.unsubs.length > 0) {
            const unsub = this.unsubs.pop();
            if (unsub) {
                unsub();
            }
        }
        this.r.clear();
    }

    render() {
        if (this.camera) {
            // this.r.render(this.scene, this.camera);
            this.composer.render();
        }
    }
}
