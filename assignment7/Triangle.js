import { Vector3 } from '../libs/index.js';
import { Bounds3 } from './Bounds3.js';
import { Intersection, Sample } from './Intersection.js';

const EPSILON = 0.00001;

class Triangle {

	v0 = undefined;
	v1 = undefined;
	v2 = undefined;

	e1 = new Vector3();
	e2 = new Vector3();
	normal = new Vector3();

	material = undefined;

	bounds = new Bounds3();
	area = 0;

	constructor(v0, v1, v2, material) {

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

		this.material = material;

		this.area = new Vector3().crossVectors(this.e1, this.e2).length() * 0.5;

	}

	getBounds() {

		return this.bounds;

	}

	getArea() {

		return this.area;

	}

	getIntersection(ray) {

		if (ray.direction.dot(this.normal) > 0) {

			return; // 光线和法线方向相同，光线永远不会和三角面的正面相交

		}

		const pvec = new Vector3().crossVectors(ray.direction, this.e2);

		const det = this.e1.dot(pvec);

		if (Math.abs(det) < EPSILON) {

			return;

		}

		const det_inv = 1 / det;

		const tvec = new Vector3();
		tvec.subVectors(ray.origin, this.v0);

		const u = tvec.dot(pvec) * det_inv;

		if (u < 0 || u > 1) {

			return;

		}

		const qvec = new Vector3();
		qvec.crossVectors(tvec, this.e1);

		const v = ray.direction.dot(qvec) * det_inv;

		if (v < 0 || u + v > 1) {

			return;

		}

		const t_tmp = this.e2.dot(qvec) * det_inv;

		if (t_tmp < 0) {

			return;

		}

		const intersection = new Intersection();

		intersection.distance = t_tmp;
		intersection.material = this.material;
		intersection.object = this;
		intersection.normal = this.normal.clone();

		intersection.coords = ray.origin.clone();
		intersection.coords.addScaledVector(ray.direction, t_tmp);

		return intersection;

	}

	areaSampling() {

		const x = Math.sqrt(Math.random());
		const y = Math.random();

		const sample = new Sample();

		sample.coords = new Vector3();
		sample.coords.addScaledVector(this.v0, 1 - x);
		sample.coords.addScaledVector(this.v1, x * (1 - y));
		sample.coords.addScaledVector(this.v2, x * y);

		sample.normal = this.normal.clone();

		sample.pdf = 1 / this.area;

		return sample;

	}

}

export { Triangle };
