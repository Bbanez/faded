float saturateFloat(float x) {
    return clamp(x, 0.0, 1.0);
}

float inverseLerp(float minValue, float maxValue, float v) {
    return (v - minValue) / (maxValue - minValue);
}

float inverseLerpSat(float minValue, float maxValue, float v) {
    return saturate((v - minValue) / (maxValue - minValue));
}

float remap(float v, float inMin, float inMax, float outMin, float outMax) {
    float t = inverseLerp(inMin, inMax, v);
    return mix(outMin, outMax, t);
}

float opUnion(float d1, float d2) {
    return min(d1, d2);
}

float softMax(float a, float b, float k) {
    return log(exp(k * a) + exp(k * b)) / k;
}

float softMin(float a, float b, float k) {
    return -softMax(-a, -b, k);
}

float softMinValue(float a, float b, float k) {
    return remap(a - b, -1.0 / k, 1.0 / k, 0.0, 1.0);
}

vec3 linearTosRGB(vec3 value) {
    vec3 lt = vec3(lessThanEqual(value.rgb, vec3(0.0031308)));

    vec3 v1 = value * 12.92;
    vec3 v2 = pow(value.xyz, vec3(0.41666)) * 1.055 - vec3(0.055);

    return mix(v2, v1, lt);
}

float Math_Random(vec2 p) {
    p = 50.0 * fract(p * 0.3183099 + vec2(0.71, 0.113));
    return -1.0 + 2.0 * fract(p.x * p.y * (p.x + p.y));
}

float noise(in vec2 p)
{
    vec2 i = floor(p);
    vec2 f = fract(p);

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(mix(Math_Random(i + vec2(0.0, 0.0)),
                   Math_Random(i + vec2(1.0, 0.0)), u.x),
               mix(Math_Random(i + vec2(0.0, 1.0)),
                   Math_Random(i + vec2(1.0, 1.0)), u.x), u.y);
}