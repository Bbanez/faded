//varying vec2 vUv;
//varying vec3 vPosition;
//varying vec3 vWorldPosition;
//
//uniform float uHash;
//
//mat3 rotateX(float theta) {
//    float c = cos(theta);
//    float s = sin(theta);
//    return mat3(
//        vec3(1, 0, 0),
//        vec3(0, c, -s),
//        vec3(0, s, c)
//    );
//}
//
//void main() {
//    vUv = uv;
//    vPosition = position;
//    vec3 worldPosition = (modelViewMatrix * vec4(position, 1)).xyz;
//    vWorldPosition = worldPosition;
//    float curveAmount = uHash * position.y;
//    mat3 grassMat = rotateX(curveAmount);
//    vec3 grassVertPosition = grassMat * vec3(position.x, position.y, 0.0);
//    gl_Position = projectionMatrix * modelViewMatrix * vec4(grassVertPosition, 1);
//}

#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
    varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>


varying vec2 vUv;
varying vec3 vPosition;
varying vec4 vWorldPosition;

attribute vec3 offset;
attribute vec4 orientation;

uniform float uMillis;
uniform float uHash;

mat3 rotateX(float theta) {
    float c = cos(theta);
    float s = sin(theta);
    return mat3(
        vec3(1, 0, 0),
        vec3(0, c, -s),
        vec3(0, s, c)
    );
}

mat3 rotateY(float theta) {
    float c = cos(theta);
    float s = sin(theta);
    return mat3(
        vec3(c, 0.0, s),
        vec3(0.0, 1.0, 0.0),
        vec3(-s, 0.0, c)
    );
}

uint murmurHash12(uvec2 src) {
    const uint M = 0x5bd1e995u;
    uint h = 1190494759u;
    src *= M; src ^= src>>24u; src *= M;
    h *= M; h ^= src.x; h *= M; h ^= src.y;
    h ^= h>>13u; h *= M; h ^= h>>15u;
    return h;
}

float hash12(vec2 src) {
    uint h = murmurHash12(floatBitsToUint(src));
    return uintBitsToFloat(h & 0x007fffffu | 0x3f800000u) - 1.0;
}

float noise12(vec2 p) {
    vec2 i = floor(p);

    vec2 f = fract(p);
    vec2 u = smoothstep(vec2(0.0), vec2(1.0), f);

    float val = mix(mix(hash12(i + vec2(0.0, 0.0)),
                        hash12(i + vec2(1.0, 0.0)), u.x),
                    mix(hash12(i + vec2(0.0, 1.0)),
                        hash12(i + vec2(1.0, 1.0)), u.x), u.y);
    return val * 2.0 - 1.0;
}

void main() {
    #include <uv_vertex>
    #include <color_vertex>
    #include <morphcolor_vertex>
    #include <batching_vertex>
    #include <beginnormal_vertex>
    #include <morphnormal_vertex>
    #include <skinbase_vertex>
    #include <skinnormal_vertex>
    #include <defaultnormal_vertex>
    #include <normal_vertex>
    #include <begin_vertex>
    #include <morphtarget_vertex>
    #include <skinning_vertex>
    #include <displacementmap_vertex>
    #include <project_vertex>
    #include <logdepthbuf_vertex>
    #include <clipping_planes_vertex>
    vViewPosition = -mvPosition.xyz;
    #include <worldpos_vertex>
    #include <shadowmap_vertex>
    #include <fog_vertex>
    #ifdef USE_TRANSMISSION
        vWorldPosition = worldPosition.xyz;
    #endif
    vUv = uv;
    vWorldPosition = worldPosition;
    vPosition = offset * max( abs( uMillis * 2.0 + 1.0 ), 0.5 ) + position;
    float randomAngle = hash12(worldPosition.xz);
    vPosition.x *= cos(randomAngle);
    vPosition.z *= sin(randomAngle);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.0);
}