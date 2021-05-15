import type { Camera, Scene, Vector3, Color } from 'three';
import type { Point2D } from '../point';

export interface Particle {
  position: Vector3;
  size: number;
  color: {
    value: Color;
    alpha: number;
  };
  angle: Point2D;
}
export interface ParticleSystemConfig {
  texturePath: string;
  onReady?: () => void;
}
export interface ParticleSystemPrototype {
  updateGeometry(): void;
  updateParticles(): void;
  addParticle(particle: Particle): void;
  addParticles(particles: Particle[]): void;
  isReady(): boolean;
  useCamera(camera: Camera): void;
  addTo(s: Scene): void;
  destroy(): void;
}
