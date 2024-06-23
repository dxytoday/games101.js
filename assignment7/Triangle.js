import * as THREE from '../math/three.js';
import { Bounds3 } from './Bounds3.js';
import { Intersection } from './Intersection.js';

const EPSILON = 0.00001;

export class Triangle {

	v0;
	v1;
	v2;
	e1 = new THREE.Vector3();
	e2 = new THREE.Vector3();
	normal = new THREE.Vector3();

	m;
	area = 0;

	bounds = new Bounds3();

	constructor(v0, v1, v2, m) {

		this.v0 = v0;
		this.v1 = v1;
		this.v2 = v2;

		this.e1.subVectors(v1, v0);
		this.e2.subVectors(v2, v0);

		this.normal.crossVectors(this.e1, this.e2);
		this.normal.normalize();

		this.bounds.expandByPoint(v0);
		this.bounds.expandByPoint(v1);
		this.bounds.expandByPoint(v2);

		this.m = m;

		this.area = new THREE.Vector3().crossVectors(this.e1, this.e2).length() * 0.5;

	}

	getIntersection(ray) {

		const inter = new Intersection();

		if (ray.direction.dot(this.normal) > 0) {

			return inter;

		}

		const pvec = new THREE.Vector3();
		pvec.crossVectors(ray.direction, this.e2)

		const det = this.e1.dot(pvec);

		if (Math.abs(det) < EPSILON) {

			return inter;

		}

		const det_inv = 1 / det;

		const tvec = new THREE.Vector3();
		tvec.subVectors(ray.origin, this.v0);

		const u = tvec.dot(pvec) * det_inv;

		if (u < 0 || u > 1) {

			return inter;

		}

		const qvec = new THREE.Vector3();
		qvec.crossVectors(tvec, this.e1);

		const v = ray.direction.dot(qvec) * det_inv;

		if (v < 0 || u + v > 1) {

			return inter;

		}

		const t_tmp = this.e2.dot(qvec) * det_inv;

		if (t_tmp < 0) {

			return inter;

		}

		inter.distance = t_tmp;
		inter.happened = true;
		inter.m = this.m;
		inter.obj = this;
		inter.normal = this.normal;

		inter.coords.copy(ray.origin);
		inter.coords.addScaledVector(ray.direction, t_tmp);

		return inter;

	}

	getArea() {

		return this.area;

	}

	sample(pos) {

		const x = Math.sqrt(Math.random());
		const y = Math.random();

		pos.coords.set(0, 0, 0);
		pos.coords.addScaledVector(this.v0, 1 - x);
		pos.coords.addScaledVector(this.v1, x * (1 - y));
		pos.coords.addScaledVector(this.v2, x * y);

		pos.normal.copy(this.normal);

		pos.pdf = 1 / this.area;

	}

}