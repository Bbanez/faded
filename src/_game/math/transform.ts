export function matToVecIndex(x: number, y: number, cols: number): number {
    return x + y * cols;
}

export function vecToMatIndex(idx: number, cols: number): [number, number] {
    const x = idx % cols;
    const y = (idx - x) / cols;
    return [x, y];
}
