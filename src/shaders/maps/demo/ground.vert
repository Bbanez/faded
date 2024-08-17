//
//
//varying vec3 vNormal;
//varying vec3 vPosition;
//varying vec3 vPos;
//
//void main() {
//    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
//    vNormal = (modelMatrix * vec4(normal, 0.0)).xyz;
//    vPos = position;
//    vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
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

#include "../../common"

varying vec2 vUv;
varying vec3 vNorm;
varying vec3 vPosition;
varying vec3 vPos;
varying vec3 vViewPos;

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
    vNorm = (modelMatrix * vec4(normal, 0.0)).xyz;
    //    mat3 normalMatrix = transpose(inverse(mat3(modelViewMatrix)));
    //    vNorm = normalize(normalMatrix * normal);
    vPos = position;
    vPosition = (modelMatrix * vec4(position, 1.0)).xyz;

    vec4 pos = vec4(position, 1.0);
    vec4 mpos = modelViewMatrix * pos;
    vViewPos = -mpos.xyz;
}