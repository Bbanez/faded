#include "../../common"

varying vec3 vNormal;
varying vec3 vPosition;

uniform float uTime;
uniform vec2 uScreen;
uniform vec3 uBaseColor;
uniform vec3 uMapSize;

void main() {
    vec3 normal = normalize(vNormal);
    vec3 baseColor = uBaseColor;

    vec3 cliffColor = vec3(0.337, 0.271, 0.165);
    vec3 grassColor = vec3(0.243, 0.576, 0.404);
    vec3 snowColor = vec3(1.0, 1.0, 1.0);

    vec3 lighting = vec3(0.0);
    vec3 color = vec3(0.0);

    float baseSplit1 = 0.8;
    float baseSplit2 = 0.95;
    float topNormal = normal.y;
    if (topNormal >= 0.0 && topNormal < baseSplit1) {
        color = cliffColor;
    } else if (topNormal >= baseSplit1 && topNormal < baseSplit2) {
        color = mix(grassColor, cliffColor, remap(topNormal, baseSplit1, baseSplit2, 0.0, 1.0));
    } else {
        color = grassColor;
    }
    if (vPosition.y > 7.0) {
//        color = snowColor;
        color = mix(color, snowColor, remap(vPosition.y, 7.0, 8.0, 0.0, 1.0));
    }

    // Ambient
    vec3 ambient = vec3(0.5);

    // Hemi light
    vec3 skyColor = vec3(0.0, 0.3, 0.6);
    vec3 groundColor = vec3(0.6, 0.3, 0.1);
    float hemiMix = remap(normal.y, -1.0, 1.0, 0.0, 1.0);
    vec3 hemi = mix(groundColor, skyColor, hemiMix);

    // Diffuse light
    vec3 lightDir = normalize(vec3(-1.0, 1.0, -1.0));
    vec3 lightColor = vec3(0.259,0.365,0.839);
    float dp = max(0.0, dot(lightDir, normal));
    vec3 diffuse = dp * lightColor;


    float terrainHeight = remap(vPosition.y, 0.0, uMapSize.y * 2.0, 0.0, 1.0);

    lighting = ambient * 0.001 + diffuse * 0.05;

    //    color = vec3(vPosition.x);
    color = color * lighting;
    color = linearTosRGB(color);

    gl_FragColor = vec4(color, 1.0);
}