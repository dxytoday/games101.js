import { Vector3 } from 'three';
import { BVHAccel } from './BVHAccel.js';
import { Bounds3 } from './Bounds3.js';
import { DIFFUSE_AND_GLOSSY, Material } from './Material.js';
import { Triangle } from './Triangle.js';

class Mesh {

	bounding_box = new Bounds3();

	triangles = [];

	bvh = undefined;

	material = new Material(

		DIFFUSE_AND_GLOSSY,
		new Vector3(128, 128, 128),
		new Vector3(0, 0, 0),

	);

	constructor(positions) {

		const v1 = new Vector3();
		const v2 = new Vector3();
		const v3 = new Vector3();

		for (let ii = 0, il = positions.length / 3; ii < il; ii += 3) {

			v1.fromArray(positions, ii * 3);
			v2.fromArray(positions, (ii + 1) * 3);
			v3.fromArray(positions, (ii + 2) * 3);

			// 模型整体放大 60 倍
			v1.multiplyScalar(60);
			v2.multiplyScalar(60);
			v3.multiplyScalar(60);

			this.bounding_box.expandByPoint(v1);
			this.bounding_box.expandByPoint(v2);
			this.bounding_box.expandByPoint(v3);

			const triangle = new Triangle(

				v1.clone(),
				v2.clone(),
				v3.clone(),
				this.material

			);

			this.triangles.push(triangle);

		}

		this.bvh = new BVHAccel(this.triangles);

	}

	getBounds() {

		return this.bounding_box;

	}

	getIntersection(ray) {

		if (this.bvh) {

			return this.bvh.intersect(ray);

		}

	}

}

export { Mesh };
