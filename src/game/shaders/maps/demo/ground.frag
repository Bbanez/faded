//#include "../../common"
//
//varying vec3 vNormal;
//varying vec3 vPosition;
//
//uniform float uTime;
//uniform vec2 uScreen;
//uniform vec3 uBaseColor;
//uniform vec3 uMapSize;
//
//void main() {
//    vec3 normal = normalize(vNormal);
//    vec3 baseColor = uBaseColor;
//
//    vec3 cliffColor = vec3(0.337, 0.271, 0.165);
//    vec3 grassColor = vec3(0.243, 0.576, 0.404);
//    vec3 snowColor = vec3(1.0, 1.0, 1.0);
//
//    vec3 lighting = vec3(0.0);
//    vec3 color = vec3(0.0);
//
//    float baseSplit1 = 0.8;
//    float baseSplit2 = 0.95;
//    float topNormal = normal.y;
//    if (topNormal >= 0.0 && topNormal < baseSplit1) {
//        color = cliffColor;
//    } else if (topNormal >= baseSplit1 && topNormal < baseSplit2) {
//        color = mix(grassColor, cliffColor, remap(topNormal, baseSplit1, baseSplit2, 0.0, 1.0));
//    } else {
//        color = grassColor;
//    }
//    if (vPosition.y > 7.0) {
////        color = snowColor;
//        color = mix(color, snowColor, remap(vPosition.y, 7.0, 8.0, 0.0, 1.0));
//    }
//
//    // Ambient
//    vec3 ambient = vec3(0.5);
//
//    // Hemi light
//    vec3 skyColor = vec3(0.0, 0.3, 0.6);
//    vec3 groundColor = vec3(0.6, 0.3, 0.1);
//    float hemiMix = remap(normal.y, -1.0, 1.0, 0.0, 1.0);
//    vec3 hemi = mix(groundColor, skyColor, hemiMix);
//
//    // Diffuse light
//    vec3 lightDir = normalize(vec3(-1.0, 1.0, -1.0));
//    vec3 lightColor = vec3(0.259,0.365,0.839);
//    float dp = max(0.0, dot(lightDir, normal));
//    vec3 diffuse = dp * lightColor;
//
//
//    float terrainHeight = remap(vPosition.y, 0.0, uMapSize.y * 2.0, 0.0, 1.0);
//
//    lighting = ambient * 0.001 + diffuse * 0.05;
//
//    //    color = vec3(vPosition.x);
//    color = color * lighting;
//    color = linearTosRGB(color);
//
//    gl_FragColor = vec4(color, 1.0);
//}

#define STANDARD
#ifdef PHYSICAL
    #define IOR
    #define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
    uniform float ior;
#endif
#ifdef USE_SPECULAR
    uniform float specularIntensity;
uniform vec3 specularColor;
#ifdef USE_SPECULAR_COLORMAP
        uniform sampler2D specularColorMap;
#endif
    #ifdef USE_SPECULAR_INTENSITYMAP
        uniform sampler2D specularIntensityMap;
#endif
#endif
#ifdef USE_CLEARCOAT
    uniform float clearcoat;
uniform float clearcoatRoughness;
#endif
#ifdef USE_IRIDESCENCE
    uniform float iridescence;
uniform float iridescenceIOR;
uniform float iridescenceThicknessMinimum;
uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
    uniform vec3 sheenColor;
uniform float sheenRoughness;
#ifdef USE_SHEEN_COLORMAP
        uniform sampler2D sheenColorMap;
#endif
    #ifdef USE_SHEEN_ROUGHNESSMAP
        uniform sampler2D sheenRoughnessMap;
#endif
#endif
#ifdef USE_ANISOTROPY
    uniform vec2 anisotropyVector;
#ifdef USE_ANISOTROPYMAP
        uniform sampler2D anisotropyMap;
#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

#include "../../common"

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vPos;
varying vec3 vNorm;
varying vec3 vViewPos;

uniform float uTime;
uniform vec2 uScreen;
uniform vec3 uBaseColor;
uniform vec3 uMapSize;

vec3 faceNormals(vec3 pos) {
    vec3 fdx = dFdx(pos);
    vec3 fdy = dFdy(pos);
    return normalize(cross(fdx, fdy));
}

vec4 calcColor() {
    vec3 normal = normalize(vNorm);
    //    vec3 normal = vNormal;
    float topNormal = normal.y;

    vec3 cliffColor = vec3(0.38, 0.29, 0.157) * 0.04;
    vec3 grassColor = vec3(0.224, 0.302, 0.18) * 0.1;
    vec3 snowColor = vec3(0.4, 0.9, 0.9);
    vec3 sandColor = vec3(0.6, 0.4, 0.05);
    vec3 color = vec3(0.0);


    float grassMulti = smoothstep(0.7, 0.95, topNormal);
    float cliffMulti = 1.0 - grassMulti;
    float snowMulti = smoothstep(7.0, 10.0, vPosition.y);
    float sandMulti = 1.0 - smoothstep(3.0, 3.1, vPosition.y);
    color = grassColor * grassMulti
    + cliffColor * cliffMulti
    + snowColor * snowMulti
    + sandColor * sandMulti;

    //    color = vec3(grassMulti);

    color = linearTosRGB(color);

    return vec4(color, 1.0);
}

void main() {
    #include <clipping_planes_fragment>
//	vec4 diffuseColor = vec4( diffuse, opacity );
    vec4 diffuseColor = calcColor();
    ReflectedLight reflectedLight = ReflectedLight(vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0));
    vec3 totalEmissiveRadiance = emissive;
    #include <logdepthbuf_fragment>
    #include <map_fragment>
    #include <color_fragment>
    #include <alphamap_fragment>
    #include <alphatest_fragment>
    #include <alphahash_fragment>
    #include <roughnessmap_fragment>
    #include <metalnessmap_fragment>
    #include <normal_fragment_begin>
    #include <normal_fragment_maps>
    #include <clearcoat_normal_fragment_begin>
    #include <clearcoat_normal_fragment_maps>
    #include <emissivemap_fragment>
    #include <lights_physical_fragment>
    #include <lights_fragment_begin>
    #include <lights_fragment_maps>
    #include <lights_fragment_end>
    #include <aomap_fragment>
    vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
    //    vec3 totalDiffuse = diffuseColor.xyz;
    //    vec3 totalDiffuse = reflectedLight.directDiffuse;
    //        vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
    vec3 totalSpecular = vec3(0.0);
    #include <transmission_fragment>
    vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
    //    vec3 outgoingLight = vec3(0.0);
    #ifdef USE_SHEEN
        float sheenEnergyComp = 1.0 - 0.157 * max3(material.sheenColor);
    outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
    #endif
    #ifdef USE_CLEARCOAT
        float dotNVcc = saturate(dot(geometryClearcoatNormal, geometryViewDir));
    vec3 Fcc = F_Schlick(material.clearcoatF0, material.clearcoatF90, dotNVcc);
    outgoingLight = outgoingLight * (1.0 - material.clearcoat * Fcc) + (clearcoatSpecularDirect + clearcoatSpecularIndirect) * material.clearcoat;
    #endif
    #include <opaque_fragment>
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    #include <fog_fragment>
    #include <premultiplied_alpha_fragment>
    #include <dithering_fragment>
}