import { ShadowMapType } from 'three';

export interface RendererConfig {
  shadowMapType?: ShadowMapType;
  size?: {
    width: number;
    height: number;
  };
}

import { PCFSoftShadowMap, WebGLRenderer } from 'three';
import type { PerspectiveCamera, Scene } from 'three';
import { Ticker } from './ticker';

export class Renderer {
  r = new WebGLRenderer();
  width = 0;
  height = 0;

  private unsubs: Array<() => void> = [];
  private resizeDebounce: any = undefined;

  constructor(
    el: HTMLElement,
    public scene: Scene,
    private camera: PerspectiveCamera,
    config?: RendererConfig
  ) {
    if (!config) {
      config = {};
    }
    this.r = new WebGLRenderer();
    this.r.shadowMap.enabled = true;
    this.r.shadowMap.type = config.shadowMapType || PCFSoftShadowMap;
    this.r.setPixelRatio(window.devicePixelRatio);
    if (config.size) {
      this.r.setSize(config.size.width, config.size.height);
      this.width = config.size.width;
      this.height = config.size.height;
    } else {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.r.setSize(window.innerWidth, window.innerHeight);
      window.addEventListener('resize', () => this.onResize());
      this.unsubs.push(() => {
        window.removeEventListener('resize', () => this.onResize());
      });
    }
    el.appendChild(this.r.domElement);
    this.unsubs.push(
      Ticker.subscribe(() => {
        this.render();
      })
    );
  }

  onResize() {
    clearTimeout(this.resizeDebounce);
    this.resizeDebounce = setTimeout(() => {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      if (this.camera) {
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
      }
      this.r.setSize(window.innerWidth, window.innerHeight);
      this.render();
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
      this.r.render(this.scene, this.camera);
    }
  }
}
