import postProcessingVert from '@fdd/shaders/map-maker-post-processing.vert';
import postProcessingFrag from '@fdd/shaders/map-maker-post-processing.frag';

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
import { ShaderPassManager } from '@fdd/shaders/manager.ts';
import { Ticker } from '@fdd/util/ticker.ts';
import { Mouse, MouseEventType } from '@fdd/user-input/mouse.ts';

export class MapMakerRenderer {
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

    private timeOffset = Date.now();
    private unsubs: Array<() => void> = [];

    constructor(
        public el: HTMLElement,
        public scene: Scene,
        private camera: PerspectiveCamera,
    ) {
        this.r = new WebGLRenderer();
        this.r.shadowMap.enabled = true;
        this.r.shadowMap.type = PCFSoftShadowMap;
        this.r.setPixelRatio(window.devicePixelRatio);
        this.composer = new EffectComposer(this.r);
        const resize = () => {
            this.onResize();
        };
        resize();
        window.addEventListener('resize', resize);
        this.unsubs.push(() => {
            window.removeEventListener('resize', resize);
        });
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
        el.appendChild(this.r.domElement);
    }

    loadPostProcessing() {
        this.composer.addPass(new RenderPass(this.scene, this.camera));
        this.composer.addPass(this.postProcessing.shader);
        this.composer.addPass(new OutputPass());
    }

    onResize() {
        const width = this.el.offsetWidth;
        const height = this.el.offsetHeight;
        if (this.camera) {
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
        }
        this.composer.setSize(width, height);
        this.r.setSize(width, height);
        this.r.domElement.setAttribute('style', 'width: 100%; height: 100%;');
        this.postProcessing.setUniform('uScreen', new Vector2(width, height));
        this.composer.render();
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
