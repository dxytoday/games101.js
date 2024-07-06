import { Vector3 } from '../libs/index.js';
import { BVHAccel } from './BVHAccel.js';
import { Ray } from './Ray.js';

class Scene {

	fov = 40;
	backgroundColor = new Vector3(0, 0, 0);

	objects = [];

	bvh = undefined;

	russianRoulette = 0.8;

	add(object) {

		this.objects.push(object);

	}

	buildBVH() {

		this.bvh = new BVHAccel(this.objects);

	}

	intersect(ray) {

		return this.bvh.intersect(ray);

	}

	sampleLight() {

		let emit_area_sum = 0;

		for (const eachObject of this.objects) {

			if (eachObject.hasEmission()) {

				emit_area_sum += eachObject.getArea();

			}

		}

		const p = emit_area_sum * Math.random();
		emit_area_sum = 0;

		for (const eachObject of this.objects) {

			if (eachObject.hasEmission()) {

				emit_area_sum += eachObject.getArea();

				if (p <= emit_area_sum) {

					return eachObject.areaSampling();

				}

			}

		}

	}

	castRay(ray) {







	}

}

export { Scene };
