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

		let t_Min_x = (this.min.x - ray.origin.x) * invDir.x;
		let t_Min_y = (this.min.y - ray.origin.y) * invDir.y;
		let t_Min_z = (this.min.z - ray.origin.z) * invDir.z;

		let t_Max_x = (this.max.x - ray.origin.x) * invDir.x;
		let t_Max_y = (this.max.y - ray.origin.y) * invDir.y;
		let t_Max_z = (this.max.z - ray.origin.z) * invDir.z;

		if (!dirIsNeg[0]) {

			const t = t_Min_x;
			t_Min_x = t_Max_x;
			t_Max_x = t;

		}

		if (!dirIsNeg[1]) {

			const t = t_Min_y;
			t_Min_y = t_Max_y;
			t_Max_y = t;

		}

		if (!dirIsNeg[2]) {

			const t = t_Min_z;
			t_Min_z = t_Max_z;
			t_Max_z = t;

		}

		const t_enter = Math.max(t_Min_x, Math.max(t_Min_y, t_Min_z));
		const t_exit = Math.min(t_Max_x, Math.min(t_Max_y, t_Max_z));

		return t_enter < t_exit && t_exit >= 0;

	}


}

export { Bounds3 };
