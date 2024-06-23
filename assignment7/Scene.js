import * as THREE from '../math/three.js';
import { BVHAccel } from './BVHAccel.js';
import { MaterialType } from '../assignment5/Object.js';
import { Ray } from './Ray.js';

export class Scene {

	width = 0;
	height = 0;

	fov = 40;
	backgroundColor = new THREE.Vector3(0.235294, 0.67451, 0.843137);

	maxDepth = 5;
	epsilon = 0.00001;

	objects = [];
	lights = [];

	bvh;

	russianRoulette = 0.5;

	constructor(width, height) {

		this.width = width;
		this.height = height;

	}

	addObject(object) {

		this.objects.push(object);

	}

	addLight(light) {

		this.lights.push(light);

	}

	buildBVH() {

		this.bvh = new BVHAccel(this.objects);

	}

	intersect(ray) {

		return this.bvh.intersect(ray);

	}

	sampleLight() {

		let emit_area_sum = 0;

		for (const each of this.objects) {

			if (each.hasEmit()) {

				emit_area_sum += each.getArea();

			}

		}

		const p = emit_area_sum * Math.random();
		emit_area_sum = 0;

		for (const each of this.objects) {

			if (each.hasEmit()) {

				emit_area_sum += each.getArea();

				if (p <= emit_area_sum) {

					return each.sample();

				}

			}

		}

	}

	castRay(ray) {

		const intersection = this.intersect(ray);

		if (!intersection.happened) {

			return this.backgroundColor.clone();

		}

		if (intersection.m.hasEmission()) {

			return intersection.m.getEmission();

		}

		const L_dir = new THREE.Vector3();

		const L_dir_Inter = this.sampleLight();

		let pdf_light = L_dir_Inter.pdf;

		const p = intersection.coords;

		const x = L_dir_Inter.coords;

		const wo = ray.direction;

		const ws = x.clone().sub(p).normalize();

		const p_2_light_ray = new Ray(p, ws);
		const p_2_light_inter = this.intersect(p_2_light_ray);

		if (p_2_light_inter.distance - x.distanceTo(p) > -0.005) {

			const f_r = intersection.m.eval(wo, ws, intersection.normal);

			const distance2 = x.distanceTo(p) * x.distanceTo(p);

			L_dir.copy(L_dir_Inter.emit);
			L_dir.multiply(f_r);
			L_dir.multiplyScalar(ws.dot(intersection.normal));
			L_dir.multiplyScalar(ws.clone().negate().dot(L_dir_Inter.normal));
			L_dir.divideScalar(distance2);
			L_dir.divideScalar(pdf_light);

		}

		const L_indir = new THREE.Vector3();

		if (Math.random() <= this.russianRoulette) {

			L_indir.set(0.1, 0.1, 0.1);

			const wi = intersection.m.sample(intersection.normal).normalize();

			const L_indir_Ray = new Ray(p, wi);

			const L_indir_Inter = this.intersect(L_indir_Ray);

			if (L_indir_Inter.happened && !L_indir_Inter.m.hasEmission()) {

				const pdf = intersection.m.pdf(wo, wi, intersection.normal);

				L_indir.copy(this.castRay(L_indir_Ray));
				L_indir.multiply(L_indir_Inter.m.eval(wo, wi, intersection.normal));
				L_indir.multiplyScalar(wi.dot(intersection.normal));
				L_indir.divideScalar(pdf);
				L_indir.divideScalar(this.russianRoulette);

			}

		}

		return L_dir.add(L_indir);

	}

}