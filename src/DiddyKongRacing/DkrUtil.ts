import { mat4, quat, vec3 } from "gl-matrix";
import { Camera } from "../Camera";
import { DkrTexture } from "./DkrTexture";
import { SIZE_OF_TRIANGLE_FACE, SIZE_OF_VERTEX } from "./DkrTriangleBatch";

export const IDENTITY_MATRIX: mat4 = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
];

export function buf2hex(buffer: ArrayBuffer) {
    return Array.prototype.map.call(new Uint8Array(buffer), (x:any) => ('00' + x.toString(16)).slice(-2)).join('');
}

export function isFlagSet(flags: number, flag: number) {
    return (flags & flag) == flag;
}

export function writeShortInBytes(arr: Uint8Array, offset: number, val: number): void {
    val = Math.floor(val);
    arr[offset] = (val >> 8) & 0xFF;
    arr[offset + 1] = val & 0xFF;
}

// from: https://stackoverflow.com/a/9458996
export function arrayBufferToBase64(buffer: Uint8Array) {
    var binary = '';
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

export function createVertexData(vertices: any): Uint8Array {
    let out = new Uint8Array(vertices.length * SIZE_OF_VERTEX);

    for(let i = 0; i < vertices.length; i++) {
        let offset = i * SIZE_OF_VERTEX;
        writeShortInBytes(out, offset + 0, vertices[i].x);
        writeShortInBytes(out, offset + 2, vertices[i].y);
        writeShortInBytes(out, offset + 4, vertices[i].z);
        out[offset + 6] = vertices[i].r;
        out[offset + 7] = vertices[i].g;
        out[offset + 8] = vertices[i].b;
        out[offset + 9] = vertices[i].a;
    }

    return out;
}

export function createTriangleData(triangles: any, texture: DkrTexture): Uint8Array {
    let out = new Uint8Array(triangles.length * SIZE_OF_TRIANGLE_FACE);

    const uInvScale = texture.getWidth() * 32.0;
    const vInvScale = texture.getHeight() * 32.0;

    for(let i = 0; i < triangles.length; i++) {
        let offset = i * SIZE_OF_TRIANGLE_FACE;
        out[offset] = triangles[i].drawBackface ? 0x40 : 0x00;
        out[offset + 1] = triangles[i].v0;
        out[offset + 2] = triangles[i].v1;
        out[offset + 3] = triangles[i].v2;
        writeShortInBytes(out, offset + 4, triangles[i].uv0[0] * uInvScale);
        writeShortInBytes(out, offset + 6, triangles[i].uv0[1] * vInvScale);
        writeShortInBytes(out, offset + 8, triangles[i].uv1[0] * uInvScale);
        writeShortInBytes(out, offset + 10, triangles[i].uv1[1] * vInvScale);
        writeShortInBytes(out, offset + 12, triangles[i].uv2[0] * uInvScale);
        writeShortInBytes(out, offset + 14, triangles[i].uv2[1] * vInvScale);
    }

    return out;
}

export function updateCameraViewMatrix(camera: Camera): void {
    mat4.invert(camera.viewMatrix, camera.worldMatrix);
    camera.worldMatrixUpdated();
}

// Mixture of three.js & glmatrix code.
// Code from three.js: https://github.com/mrdoob/three.js/blob/dev/src/math/Quaternion.js#L187
// Code from glmatrix: http://glmatrix.net/docs/quat.js.html#line459
export function createQuaternionFromEuler(out: quat, x: number, y: number, z: number, order: string): void {
    let halfToRad = (0.5 * Math.PI) / 180.0;
    const c1 = Math.cos(x * halfToRad);
    const c2 = Math.cos(y * halfToRad);
    const c3 = Math.cos(z * halfToRad);
    const s1 = Math.sin(x * halfToRad);
    const s2 = Math.sin(y * halfToRad);
    const s3 = Math.sin(z * halfToRad);

    switch ( order ) {
			case 'XYZ':
				out[0] = s1 * c2 * c3 + c1 * s2 * s3;
				out[1] = c1 * s2 * c3 - s1 * c2 * s3;
				out[2] = c1 * c2 * s3 + s1 * s2 * c3;
				out[3] = c1 * c2 * c3 - s1 * s2 * s3;
				break;
			case 'YXZ':
				out[0] = s1 * c2 * c3 + c1 * s2 * s3;
				out[1] = c1 * s2 * c3 - s1 * c2 * s3;
				out[2] = c1 * c2 * s3 - s1 * s2 * c3;
				out[3] = c1 * c2 * c3 + s1 * s2 * s3;
				break;
			case 'ZXY':
				out[0] = s1 * c2 * c3 - c1 * s2 * s3;
				out[1] = c1 * s2 * c3 + s1 * c2 * s3;
				out[2] = c1 * c2 * s3 + s1 * s2 * c3;
				out[3] = c1 * c2 * c3 - s1 * s2 * s3;
				break;
			case 'ZYX':
				out[0] = s1 * c2 * c3 - c1 * s2 * s3;
				out[1] = c1 * s2 * c3 + s1 * c2 * s3;
				out[2] = c1 * c2 * s3 - s1 * s2 * c3;
				out[3] = c1 * c2 * c3 + s1 * s2 * s3;
				break;
			case 'YZX':
				out[0] = s1 * c2 * c3 + c1 * s2 * s3;
				out[1] = c1 * s2 * c3 + s1 * c2 * s3;
				out[2] = c1 * c2 * s3 - s1 * s2 * c3;
				out[3] = c1 * c2 * c3 - s1 * s2 * s3;
				break;
			case 'XZY':
				out[0] = s1 * c2 * c3 - c1 * s2 * s3;
				out[1] = c1 * s2 * c3 - s1 * c2 * s3;
				out[2] = c1 * c2 * s3 + s1 * s2 * c3;
				out[3] = c1 * c2 * c3 + s1 * s2 * s3;
				break;
			default:
				console.warn( 'createQuaternionFromEuler() encountered an unknown order: ' + order );
		}
}

