import {
    PCFSoftShadowMap,
    PerspectiveCamera,
    Scene,
    WebGLRenderer,
} from 'three';
import postProcessingVert from './shaders/post-processing.vert';
import postProcessingFrag from './shaders/post-processing.frag';
import { Ticker } from './ticker';
import { useSettings } from '../hooks/settings.ts';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass';
import { Mouse, MouseEventType } from './mouse.ts';

export class Renderer {
    r = new WebGLRenderer();
    composer: EffectComposer;
    postProcessingShader = new ShaderPass({
        uniforms: {
            tDiffuse: null,
            tGrad: { value: null as any },
            uMillis: { value: 0.0 },
            uMouse: { value: [0.0, 0.0] },
            uScreen: { value: [window.innerWidth, window.innerHeight] },
        },
        fragmentShader: postProcessingFrag,
        vertexShader: postProcessingVert,
    });

    private unsubs: Array<() => void> = [];
    private resizeDebounce: any = undefined;

    constructor(
        el: HTMLElement,
        public scene: Scene,
        private camera: PerspectiveCamera,
    ) {
        const settings = useSettings();
        this.r = new WebGLRenderer();
        this.r.shadowMap.enabled = true;
        this.r.shadowMap.type = PCFSoftShadowMap;
        this.r.setPixelRatio(window.devicePixelRatio);
        this.composer = new EffectComposer(this.r);
        if (settings.data.value) {
            this.r.setSize(
                settings.data.value.resolution.width,
                settings.data.value.resolution.height,
            );
        } else {
            this.r.setSize(window.innerWidth, window.innerHeight);
            // this.r.setSize(200, 200);
            window.addEventListener('resize', () => this.onResize());
            this.unsubs.push(() => {
                window.removeEventListener('resize', () => this.onResize());
            });
        }
        this.r.domElement.setAttribute('style', 'width: 100%; height: 100%;');
        el.appendChild(this.r.domElement);
        this.unsubs.push(
            Ticker.subscribe(async (_cTime, deltaTime) => {
                this.postProcessingShader.uniforms.uMillis.value += deltaTime;
                this.render();
            }),
            Mouse.subscribe(MouseEventType.MOUSE_MOVE, (data) => {
                this.postProcessingShader.uniforms.uMouse.value = [
                    data.x,
                    data.y,
                ];
            }),
        );
    }

    async loadPostProcessing() {
        this.composer.addPass(new RenderPass(this.scene, this.camera));
        this.composer.addPass(this.postProcessingShader);
        this.composer.addPass(new OutputPass());
    }

    onResize() {
        clearTimeout(this.resizeDebounce);
        this.resizeDebounce = setTimeout(() => {
            const settings = useSettings();
            if (settings.data.value) {
                if (this.camera) {
                    this.camera.aspect =
                        settings.data.value.resolution.width /
                        settings.data.value.resolution.height;
                    this.camera.updateProjectionMatrix();
                }
                this.composer.setSize(
                    settings.data.value.resolution.width,
                    settings.data.value?.resolution.height,
                );
                this.r.domElement.setAttribute(
                    'style',
                    'width: 100%; height: 100%;',
                );
                this.composer.render();
            }
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

    // setCamera(camera: PerspectiveCamera): void {
    //   this.camera = camera;
    //   this.camera.aspect = this.width / this.height;
    //   this.camera.updateProjectionMatrix();
    // }

    render() {
        if (this.camera) {
            // this.r.render(this.scene, this.camera);
            this.composer.render();
        }
    }
}
