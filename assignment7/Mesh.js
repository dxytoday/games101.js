import { Vector3 } from '../libs/index.js';
import { BVHAccel } from './BVHAccel.js';
import { Bounds3 } from './Bounds3.js';
import { Triangle } from './Triangle.js';

class Mesh {

	bounding_box = new Bounds3();

	triangles = [];

	bvh = undefined;

	material = undefined;

	area = 0;

	constructor(positions, material) {

		this.material = material;

		const v1 = new Vector3();
		const v2 = new Vector3();
		const v3 = new Vector3();

		for (let ii = 0, il = positions.length / 3; ii < il; ii += 3) {

			v1.fromArray(positions, ii * 3);
			v2.fromArray(positions, (ii + 1) * 3);
			v3.fromArray(positions, (ii + 2) * 3);

			this.bounding_box.expandByPoint(v1);
			this.bounding_box.expandByPoint(v2);
			this.bounding_box.expandByPoint(v3);

			const triangle = new Triangle(

				v1.clone(),
				v2.clone(),
				v3.clone(),
				this.material

			);

			this.area += triangle.getArea();

			this.triangles.push(triangle);

		}

		this.bvh = new BVHAccel(this.triangles);

	}

	hasEmission() {

		return this.material.hasEmission();

	}

	getBounds() {

		return this.bounding_box;

	}

	getArea() {

		return this.area;

	}

	areaSampling() {

		const sample = this.bvh.areaSampling();

		sample.emmission = this.material.getEmission();

		return sample;

	}

	getIntersection(ray) {

		if (this.bvh) {

			const intersection = this.bvh.intersect(ray);

			if (intersection) {

				intersection.mesh = this;

			}

			return intersection;

		}

	}

}

export { Mesh };
