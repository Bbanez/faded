uniform sampler2D tDiffuse;
uniform sampler2D tGrad;
uniform float uMillis;
uniform vec2 uMouse;
uniform vec2 uScreen;

varying vec2 vUv;

void main() {
    vec4 texel = texture2D(tDiffuse, vUv);
    //    float c = (sin(vUv.x * 16.0 + uMillis / 500.0) + 1.0) / 2.0;
    //    float d = (sin(vUv.y * vUv.x * 16.0 + uMillis / 1000.0) + 1.0) / 2.0;
    //    gl_FragColor = vec4(c, d, 1.0, 1.0) * texel;
    // float grayscale = (texel.r + texel.g + texel.b) / 3.0;
    // gl_FragColor = vec4(grayscale, grayscale, grayscale, texel.a);
    gl_FragColor = texel;
}
