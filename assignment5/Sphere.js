import { Vector3 } from '../libs/index.js';
import { Object } from "./Object.js";

class Sphere extends Object {

	center = undefined;
	radius = 0;
	radiusSq = 0;

	constructor(center, radius) {

		super();

		this.center = center;
		this.radius = radius;
		this.radiusSq = radius * radius;

	}

	intersect(origin, direction) {

		const vector = new Vector3();

		vector.subVectors(this.center, origin);

		const tca = vector.dot(direction);

		const d2 = vector.dot(vector) - tca * tca;

		if (d2 > this.radiusSq) {

			return;

		}

		const thc = Math.sqrt(this.radiusSq - d2);

		const t0 = tca - thc;

		const t1 = tca + thc;

		if (t0 < 0 && t1 < 0) {

			return;

		}

		return { tNearK: t0 < 0 ? t1 : t0 };

	}

	getSurfaceProperties(P) {

		const N = new Vector3();

		N.subVectors(P, this.center);
		N.normalize();

		return { N };

	}

	evalDiffuseColor() {

		return this.diffuseColor.clone();

	}

}

export { Sphere };