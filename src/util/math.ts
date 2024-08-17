export const PI14 = Math.PI / 4;
export const PI12 = Math.PI / 2;
export const PI32 = (3 * Math.PI) / 2;
export const PI34 = (3 * Math.PI) / 4;
export const PI54 = (5 * Math.PI) / 4;
export const PI74 = (7 * Math.PI) / 4;
export const PI13 = Math.PI / 3;
export const PI_2 = 2 * Math.PI;

export function getRandomFloat(min: number, max: number) {
    return Math.random() * (max - min) + min;
}

export function getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export interface Linear2D {
    call(x: number): number;
    inverse(z: number): number;
}

export function createStepedLinear2D(
    points: Array<[number, number]>,
): Linear2D {
    const k: number[] = [];
    const n: number[] = [];
    for (let i = 1; i < points.length; i++) {
        k.push(
            (points[i][1] - points[i - 1][1]) /
                (points[i][0] - points[i - 1][0]),
        );
        n.push(points[i - 1][1] - k[i - 1] * points[i - 1][0]);
    }
    return {
        call(x) {
            let bestSectionIndex = 0;
            for (let i = 0; i < points.length - 1; i++) {
                if (x >= points[i][0] && x <= points[i + 1][0]) {
                    bestSectionIndex = i;
                    break;
                }
            }
            return k[bestSectionIndex] * x + n[bestSectionIndex];
        },
        inverse(z) {
            let bestSectionIndex = 0;
            for (let i = 0; i < points.length - 1; i++) {
                if (z >= points[i][1] && z <= points[i + 1][1]) {
                    bestSectionIndex = i;
                    break;
                }
            }
            return (z - n[bestSectionIndex]) / k[bestSectionIndex];
        },
    };
}

export function createLinear2D(
    p1: [number, number],
    p2: [number, number],
): Linear2D {
    const k = (p2[1] - p1[1]) / (p2[0] - p1[0]);
    const n = p1[1] - k * p1[0];
    return {
        call(x) {
            return k * x + n;
        },
        inverse(z) {
            return (z - n) / k;
        },
    };
}
