import * as THREE from '../math/three.js';

export class Bounds3 {

	min = new THREE.Vector3().setScalar(+Infinity);
	max = new THREE.Vector3().setScalar(-Infinity);

	expandByPoint(point) {

		this.min.min(point);
		this.max.max(point);

		return this;

	}

	union(b) {

		this.min.min(b.min);
		this.max.max(b.max);

		return this;
	}

	centroid(target = new THREE.Vector3()) {

		return target.addVectors(this.min, this.max).multiplyScalar(0.5);

	}

	maxExtent() {

		const d = new THREE.Vector3();
		d.subVectors(this.max, this.min);

		if (d.x > d.y && d.x > d.z) return 0;

		else if (d.y > d.z) return 1;

		else return 2;

	}

	intersectP(ray, invDir, dirIsNeg) {

		let t_Min_x = (this.min.x - ray.origin.x) * invDir.x;
		let t_Min_y = (this.min.y - ray.origin.y) * invDir.y;
		let t_Min_z = (this.min.z - ray.origin.z) * invDir.z;

		let t_Max_x = (this.max.x - ray.origin.x) * invDir.x;
		let t_Max_y = (this.max.y - ray.origin.y) * invDir.y;
		let t_Max_z = (this.max.z - ray.origin.z) * invDir.z;

		if (dirIsNeg[0]) {

			const t = t_Min_x;
			t_Min_x = t_Max_x;
			t_Max_x = t;

		}

		if (dirIsNeg[1]) {

			const t = t_Min_y;
			t_Min_y = t_Max_y;
			t_Max_y = t;

		}

		if (dirIsNeg[2]) {

			const t = t_Min_z;
			t_Min_z = t_Max_z;
			t_Max_z = t;

		}

		const t_enter = Math.max(t_Min_x, Math.max(t_Min_y, t_Min_z));
		const t_exit = Math.min(t_Max_x, Math.min(t_Max_y, t_Max_z));

		return t_enter <= t_exit && t_exit >= 0;

	}

	surfaceArea() {

		const d = new THREE.Vector3();
		d.subVectors(this.max, this.min);

		return 2 * (d.x * d.y + d.x * d.z + d.y * d.z);

	}

}