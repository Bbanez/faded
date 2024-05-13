

varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vPos;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vNormal = (modelMatrix * vec4(normal, 0.0)).xyz;
    vPos = position;
    vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
}