import type {
  Particle,
  ParticleSystemConfig,
  ParticleSystemPrototype,
} from '../types';
import type { Camera, Texture } from 'three';
import {
  BufferGeometry,
  Float32BufferAttribute,
  NormalBlending,
  Points,
  ShaderMaterial,
} from 'three';
import { VERTEX_SHADER, FRAGMENT_SHADER } from '../shaders/particle-system';
import { Loader } from './loader';

export function ParticleSystem(
  config: ParticleSystemConfig
): ParticleSystemPrototype {
  let texture: Texture | null = null;
  let material: ShaderMaterial;
  let points: Points;
  let camera: Camera;
  const geometry = new BufferGeometry();
  const particles: Particle[] = [];

  Loader.texture(config.texturePath)
    .then((t) => {
      texture = t;
      material = new ShaderMaterial({
        uniforms: {
          dTexture: {
            value: texture,
          },
          dTextureSize: {
            value: texture.image.width,
            // window.innerWidth /
            // (2.0 * Math.tan((0.5 * 60.0 * Math.PI) / 180.0)),
          },
        },
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        blending: NormalBlending,
        depthTest: true,
        depthWrite: false,
        transparent: true,
        vertexColors: true,
      });
      points = new Points(geometry, material);
      if (config.onReady) {
        config.onReady();
      }
    })
    .catch((err) => {
      console.error(err);
    });

  return {
    updateGeometry() {
      const parts: number[] = [];
      const sizes: number[] = [];
      const colors: number[] = [];
      const angles: number[] = [];
      for (let i = 0; i < particles.length; i++) {
        parts.push(
          particles[i].position.x,
          particles[i].position.y,
          particles[i].position.z
        );
        sizes.push(particles[i].size);
        colors.push(
          particles[i].color.value.r,
          particles[i].color.value.g,
          particles[i].color.value.b,
          particles[i].color.alpha
        );
        angles.push(
          particles[i].angle.x + Math.PI,
          particles[i].angle.y + Math.PI
        );
      }
      geometry.setAttribute('position', new Float32BufferAttribute(parts, 3));
      geometry.setAttribute('aSize', new Float32BufferAttribute(sizes, 1));
      geometry.setAttribute('aColor', new Float32BufferAttribute(colors, 4));
      geometry.setAttribute('aAngle', new Float32BufferAttribute(angles, 2));
      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.aSize.needsUpdate = true;
      geometry.attributes.aColor.needsUpdate = true;
      geometry.attributes.aAngle.needsUpdate = true;
    },
    updateParticles() {
      if (camera) {
        particles.sort((a, b) => {
          const d1 = camera.position.distanceTo(a.position);
          const d2 = camera.position.distanceTo(b.position);
          if (d1 > d2) {
            return -1;
          } else if (d1 < d2) {
            return 1;
          }
          return 0;
        });
      }
    },
    isReady() {
      return !!texture;
    },
    addParticle(particle) {
      particles.push(particle);
    },
    addParticles(_particles) {
      for (let i = 0; i < _particles.length; i++) {
        particles.push(_particles[i]);
      }
    },
    useCamera(_camera) {
      camera = _camera;
    },
    addTo(scene) {
      if (!texture) {
        throw Error(
          'Texture is not loaded yet, therefore' +
            ' cannot be added to the scene'
        );
      }
      scene.add(points);
    },
    destroy() {
      if (!texture) {
        return;
      }
      points.clear();
    },
  };
}
