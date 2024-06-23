import * as THREE from '../math/three.js';

export const MaterialType = {

	DIFFUSE: 0,

};

const EPSILON = 0.00001;

export class Material {

	m_type;
	m_emmission;

	Kd;
	Ks;

	constructor(t, e) {

		this.m_type = t;
		this.m_emmission = e;

	}

	hasEmission() {

		return this.m_emmission && this.m_emmission.length() > EPSILON;

	}

	getEmission() {

		return this.m_emmission;

	}

	eval(wi, wo, N) {

		// DIFFUSE

		// calculate the contribution of diffuse   model

		const cosalpha = N.dot(wo);
		const diffuse = new THREE.Vector3();

		if (cosalpha > 0) {

			diffuse.copy(this.Kd);
			diffuse.divideScalar(Math.PI);

		}

		return diffuse;

	}

	sample(N) {

		// DIFFUSE

		// uniform sample on the hemisphere

		const x_1 = Math.random();
		const x_2 = Math.random();

		const z = Math.abs(1 - 2 * x_1);

		const r = Math.sqrt(1 - z * z);

		const phi = 2 * Math.PI * x_2;

		const localRay = new THREE.Vector3(r * Math.cos(phi), r * Math.sin(phi), z);

		const B = new THREE.Vector3();
		const C = new THREE.Vector3();

		if (Math.abs(N.x) > Math.abs(N.y)) {

			const invLen = 1.0 / Math.sqrt(N.x * N.x + N.z * N.z);

			C.set(N.z * invLen, 0.0, -N.x * invLen);

		} else {

			const invLen = 1.0 / Math.sqrt(N.y * N.y + N.z * N.z);

			C.set(0.0, N.z * invLen, -N.y * invLen);

		}

		B.crossVectors(C, N);


		const v = new THREE.Vector3();
		v.addScaledVector(B, localRay.x);
		v.addScaledVector(C, localRay.y);
		v.addScaledVector(N, localRay.z);

		return v;

	}

	pdf(wi, wo, N) {

		// DIFFUSE

		// uniform sample probability 1 / (2 * PI)

		if (wo.dot(N) > 0) {

			return 0.5 / Math.PI;

		}

		return 0;
	}

}
