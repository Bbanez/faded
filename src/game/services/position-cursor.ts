import {
  BufferGeometry,
  Camera,
  NormalBlending,
  Points,
  Scene,
  ShaderMaterial,
} from 'three';
import { VERTEX_SHADER, FRAGMENT_SHADER } from '../shaders/position-cursor';

export function createPositionCursor({
  camera,
  scene,
}: {
  camera: Camera;
  scene: Scene;
}): void {
  const material = new ShaderMaterial({
    uniforms: {},
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    blending: NormalBlending,
    depthTest: true,
    depthWrite: false,
    transparent: true,
    vertexColors: true,
  });
  const point = new Points(new BufferGeometry(), material);
  scene.add(point);

  return {
    
  }
}
