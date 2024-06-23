import * as THREE from '../math/three.js';
import { BVHAccel } from './BVHAccel.js';
import { Bounds3 } from './Bounds3.js';
import { Intersection } from './Intersection.js';
import { Material, MaterialType } from './Material.js';
import { Triangle } from './Triangle.js';

export class Mesh {

	bounds = new Bounds3();
	triangles = [];
	bvh;

	m;
	area = 0;

	constructor(positions, m) {

		this.m = m;

		const len = positions.length;

		for (let ii = 0; ii < len; ii += 3) {

			this.bounds.expandByPoint(positions[ii]);
			this.bounds.expandByPoint(positions[ii + 1]);
			this.bounds.expandByPoint(positions[ii + 2]);

			const triangle = new Triangle(

				positions[ii],
				positions[ii + 1],
				positions[ii + 2],
				m,

			);

			this.area += triangle.area;

			this.triangles.push(triangle);

		}

		this.bvh = new BVHAccel(this.triangles);

	}

	getIntersection(ray) {

		let intersec;

		if (this.bvh) {

			intersec = this.bvh.intersect(ray);

		}

		return intersec;

	}

	hasEmit() {

		return this.m.hasEmission();

	}

	getArea() {

		return this.area;

	}

	sample() {

		const pos = new Intersection();

		this.bvh.sample(pos);

		pos.emit = this.m.getEmission();

		return pos;

	}

}