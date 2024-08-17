uniform vec2 uCursor;
uniform vec2 uSize;
uniform vec2 uStepSize;
uniform vec2 uActiveCell;

varying vec2 vUv;

vec4 black = vec4(0.0, 0.0, 0.0, 1.0);
vec4 highlight = vec4(1.0, 0.0, 0.0, 0.5);

void main() {
    vec4 color = vec4(1, 1, 1, 0);
    vec2 activeCell = uActiveCell;
    activeCell.y = 1.0 - activeCell.y - uStepSize.y;
    if (
    vUv.x > activeCell.x &&
    vUv.x < activeCell.x + uStepSize.x &&
    vUv.y > activeCell.y &&
    vUv.y < activeCell.y + uStepSize.y
    ) {
        color = highlight;
    } else {
        vec2 center = vUv;
        vec2 cell = fract(center * uSize);
        cell = abs(cell - 0.5);
        float distToCell = 1.0 - 2.0 * max(cell.x, cell.y);
        float cellLine = smoothstep(0.0, 0.02, distToCell);
        color.a = 1.0 - mix(0.0, 1.0, cellLine);

    }

//    color = mix(black, color, cellLine);

    gl_FragColor = color;
}