import { Vector3, Vector2 } from '../libs/index.js';
import { Object } from "./Object.js";

function rayTriangleIntersect(v0, v1, v2, orig, dir) {

	let intersection;

	const e1 = new Vector3().subVectors(v1, v0);
	const e2 = new Vector3().subVectors(v2, v0);

	const s = new Vector3().subVectors(orig, v0);

	const s1 = new Vector3().crossVectors(dir, e2);
	const s2 = new Vector3().crossVectors(s, e1);

	const m = 1 / s1.dot(e1);

	const t = s2.dot(e2) * m;
	const u = s1.dot(s) * m;
	const v = s2.dot(dir) * m;

	if (t > 0 && (u > 0 && v > 0 && 1 - u - v >= 0 && u + v <= 1)) {

		intersection = { tNearK: t, uvK: new Vector2(u, v) };

	}

	return intersection;

}

class Mesh extends Object {

	vertices = undefined;
	vertexIndex = undefined;
	stCoordinates = undefined;

	numTriangles = 0;

	constructor(verts, vertsIndex, numTris, st) {

		super();

		this.vertices = verts;
		this.vertexIndex = vertsIndex;
		this.stCoordinates = st;

		this.numTriangles = numTris;

	}

	intersect(orig, dir) {

		let intersection

		for (let ii = 0; ii < this.numTriangles; ii++) {

			const index = this.vertexIndex[ii];

			const v0 = this.vertices[index.x];
			const v1 = this.vertices[index.y];
			const v2 = this.vertices[index.z];

			const inter = rayTriangleIntersect(v0, v1, v2, orig, dir)

			if (inter) {

				if (intersection && intersection.tNearK <= inter.tNearK) {

					continue;

				}

				inter.index = ii;

				intersection = inter;

			}

		}

		return intersection;

	}

	getSurfaceProperties(_P, payload) {

		const index = this.vertexIndex[payload.index];

		const v0 = this.vertices[index.x];
		const v1 = this.vertices[index.y];
		const v2 = this.vertices[index.z];

		const e0 = new Vector3().subVectors(v1, v0);
		const e1 = new Vector3().subVectors(v2, v1);

		const N = new Vector3().crossVectors(e0, e1).normalize();

		const t0 = this.stCoordinates[index.x];
		const t1 = this.stCoordinates[index.y];
		const t2 = this.stCoordinates[index.z];

		const uv = payload.uv;

		const { x: beta, y: gamma } = uv;

		const st = new Vector2();

		st.addScaledVector(t0, 1 - beta - gamma);
		st.addScaledVector(t1, beta);
		st.addScaledVector(t2, gamma);

		return { N, st };

	}

	evalDiffuseColor(st) {

		const scale = 5;
		const pattern = (st.x * scale % 1) > 0.5 ^ st.y * scale % 1 > 0.5;

		const c1 = new Vector3(208, 60, 8);
		const c2 = new Vector3(239, 239, 59);

		return new Vector3().lerpVectors(c1, c2, pattern);

	}

}

export { Mesh };
