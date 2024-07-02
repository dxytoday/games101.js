import { Vector3 } from '../libs/index.js';

const EPSILON = 0.00001;

function toWorld(a, N) {

	const B = new Vector3();
	const C = new Vector3();

	if (Math.abs(N.x) > Math.abs(N.y)) {

		const invLen = 1.0 / Math.sqrt(N.x * N.x + N.z * N.z);

		C.set(N.z * invLen, 0.0, -N.x * invLen);

	} else {

		const invLen = 1.0 / Math.sqrt(N.y * N.y + N.z * N.z);

		C.set(0.0, N.z * invLen, -N.y * invLen);

	}

	B.crossVectors(C, N);

	const v = new Vector3();
	v.addScaledVector(B, a.x);
	v.addScaledVector(C, a.y);
	v.addScaledVector(N, a.z);

	return v;

}

class Material {

	emmission = undefined;

	Kd = undefined;

	constructor(Kd, emmission) {

		this.Kd = Kd;

		this.emmission = emmission;

	}

	hasEmission() {

		return this.emmission && this.emmission.length() > EPSILON;

	}

	getEmission() {

		return this.emmission;

	}

	/** brdf */
	eval(wo, wi, N) {

		const diffuse = new Vector3();

		diffuse.copy(this.Kd);
		diffuse.divideScalar(Math.PI);

		return diffuse;

	}

	pdf(wo, wi, N) {

		return 0.5 / Math.PI;

	}

	sample(N) {

		const x_1 = Math.random();
		const x_2 = Math.random();

		const z = Math.abs(1 - 2 * x_1);

		const r = Math.sqrt(1 - z * z);

		const phi = 2 * Math.PI * x_2;

		const localRay = new Vector3(r * Math.cos(phi), r * Math.sin(phi), z);

		return toWorld(localRay, N);

	}

}

export { Material };


