uniform sampler2D normalTexture;
uniform float uMillis;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

#include <common>
#include "./common"

void main() {
    // vec2 uvs = vUv * remap(sin(uMillis / 2000.0), -1.0, 1.0, 1.0, 20.0);
    vec2 uvs = vUv * 20.0;
    uvs = vec2(uvs.x + uMillis / 20000.0, uvs.y);
    vec4 normalTextureColor = texture2D(normalTexture, uvs);
    // vec4 color = vec4(1.0, 1.0, 1.0, 1.0);
    // vec4 color = vec4(remap(sin(uMillis / 60.0), -1.0, 1.0, 0.0, 1.0));
    vec3 color = vec3(0.0, 0.6, 0.8) * (normalTextureColor.g / 2.0);
    float alpha = 0.95;
    // vec4 color = normalTextureColor;
    gl_FragColor = vec4(color, alpha);
}
