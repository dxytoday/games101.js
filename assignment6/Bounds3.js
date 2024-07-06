import { Vector3 } from 'three';

class Bounds3 {

	min = new Vector3().setScalar(+Infinity);
	max = new Vector3().setScalar(-Infinity);

	makeEmpty() {

		this.min.x = this.min.y = this.min.z = + Infinity;
		this.max.x = this.max.y = this.max.z = - Infinity;

		return this;

	}

	expandByPoint(point) {

		this.min.min(point);
		this.max.max(point);

		return this;

	}

	/** 并集 */
	union(bounds3) {

		this.min.min(bounds3.min);
		this.max.max(bounds3.max);

		return this;

	}

	/** 质心 */
	centroid(target = new Vector3()) {

		return target.addVectors(this.min, this.max).multiplyScalar(0.5);

	}

	/** 尺寸值最大轴 */
	maxExtent() {

		const size = new Vector3().subVectors(this.max, this.min);

		if (size.x > size.y && size.x > size.z) return 0;

		else if (size.y > size.z) return 1;

		else return 2;

	}

	intersectP(ray, invDir, dirIsNeg) {



	}


}

export { Bounds3 };
