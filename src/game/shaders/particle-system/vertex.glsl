uniform float dTextureSize;

attribute float aSize;
attribute vec4 aColor;
attribute vec2 aAngle;

varying vec4 vColor;
varying vec2 vAngle;

void main() {
    vec3 pos = position;
    pos.y += 0.25;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * dTextureSize / gl_Position.w;

    vColor = aColor;
    vAngle = vec2(cos(aAngle.x), sin(aAngle.y));
}
