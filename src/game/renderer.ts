import {
  PCFSoftShadowMap,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from 'three';
import { Ticker } from './ticker';
import { useSettings } from '../hooks/settings.ts';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import postProcessingVert from './shaders/post-processing.vert';
import postProcessingFrag from './shaders/post-processing.frag';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass';

export class Renderer {
  r = new WebGLRenderer();
  composer: EffectComposer;

  private unsubs: Array<() => void> = [];
  private resizeDebounce: any = undefined;

  constructor(
    el: HTMLElement,
    public scene: Scene,
    private camera: PerspectiveCamera,
  ) {
    const [settings] = useSettings();
    this.r = new WebGLRenderer();
    this.r.shadowMap.enabled = true;
    this.r.shadowMap.type = PCFSoftShadowMap;
    this.r.setPixelRatio(window.devicePixelRatio);
    this.composer = new EffectComposer(this.r);
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);
    this.composer.addPass(
      new ShaderPass({
        uniforms: {
          tDiffuse: null,
        },
        fragmentShader: postProcessingFrag,
        vertexShader: postProcessingVert,
      }),
    );
    // const outputPass = new OutputPass();
    this.composer.addPass(new OutputPass());
    if (settings.value) {
      this.r.setSize(
        settings.value.resolution[0],
        settings.value.resolution[1],
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
      Ticker.subscribe(async () => {
        this.render();
      }),
    );
  }

  onResize() {
    clearTimeout(this.resizeDebounce);
    this.resizeDebounce = setTimeout(() => {
      const [settings] = useSettings();
      if (settings.value) {
        if (this.camera) {
          this.camera.aspect =
            settings.value.resolution[0] / settings.value.resolution[1];
          this.camera.updateProjectionMatrix();
        }
        this.composer.setSize(...settings.value.resolution);
        this.r.domElement.setAttribute('style', 'width: 100%; height: 100%;');
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
