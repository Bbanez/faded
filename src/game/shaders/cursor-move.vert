
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

void main() {
    vUv = uv;
    vPosition = position;
    vNormal = normal;
    vec4 nPostition = projectionMatrix * modelViewMatrix * vec4(position, 1);
    gl_Position = nPostition;
}