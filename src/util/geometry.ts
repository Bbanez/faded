import { BufferGeometry, Matrix4, Vector3 } from 'three';

export function scaleGeometry(
    geo: BufferGeometry,
    scale: [number, number, number],
) {
    if (!geo.attributes.position) {
        return;
    }
    const mat = new Matrix4().makeScale(...scale);
    const position = geo.attributes.position;
    const vert = new Vector3();
    for (let i = 0; i < position.count; i++) {
        vert.fromBufferAttribute(position, i);
        vert.applyMatrix4(mat);
        position.setXYZ(i, vert.x, vert.y, vert.z);
    }
    if (scale[0] < 0 || scale[1] < 0 || scale[2] < 0) {
        const indices = geo.getIndex();
        if (indices) {
            indices.array.reverse();
            geo.setIndex(indices);
        }
        else {
            const posArray = position.array;
            for (let i = 0; i < posArray.length; i += 9) {
                const tmp = [];
                tmp[0] = posArray[i];
                tmp[1] = posArray[i + 1];
                tmp[2] = posArray[i + 2];
                posArray[i] = posArray[i + 3];
                posArray[i + 1] = posArray[i + 4];
                posArray[i + 2] = posArray[i + 5];
                posArray[i + 3] = tmp[0];
                posArray[i + 4] = tmp[1];
                posArray[i + 5] = tmp[2];
            }
        }
    }
}

export function translateGeometry(
    geo: BufferGeometry,
    offset: [number, number, number],
) {
    if (!geo.attributes.position) {
        return;
    }
    for (let k = 0; k < geo.attributes.position.array.length; k += 3) {
        geo.attributes.position.array[k] += offset[0];
        geo.attributes.position.array[k + 1] += offset[1];
        geo.attributes.position.array[k + 2] += offset[2];
    }
}

export function rotateYGeometry(geo: BufferGeometry, rotation: number) {
    if (!geo.attributes.position) {
        return;
    }
    const rotMat = new Matrix4().makeRotationY(rotation);
    const vert = new Vector3();
    for (let i = 0; i < geo.attributes.position.count; i++) {
        vert.fromBufferAttribute(geo.attributes.position, i);
        vert.applyMatrix4(rotMat);
        geo.attributes.position.setXYZ(i, vert.x, vert.y, vert.z);
    }
    geo.attributes.position.needsUpdate = true;
}
